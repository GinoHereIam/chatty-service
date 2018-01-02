// Styles
import "./style.css";
import 'typeface-roboto'
// Material-ui
import { blueGrey, red, teal } from 'material-ui/colors'

import {
    FormControlLabel, AppBar, Drawer, Input,
    Card, CardActions, CardContent, CardHeader, CardMedia, Button,
    ButtonBase, MuiThemeProvider, withTheme, Paper, Switch, TextField, Typography, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, List, ListItem, ListItemAvatar, Avatar, ListItemText
} from 'material-ui';
import { createMuiTheme } from 'material-ui';
import Slide from "material-ui/transitions/Slide";

// React
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Websocket
import ReconnectingWebSocket from "./vendor/reconnecting-websocket.min";

// Own Components
import ChattySnackbar from "./components/elements/Snackbar";
import Header from "./components/elements/Header";
import Service from "./components/Init";
import RegisterElements from "./components/Register";
import LoginElements from "./components/Login";
import Chat from "./components/Chat";
import {getDnMode} from "./util/dnmode";
import {Version} from './util/version';
import {encrypt} from "./util/encrypt";
import ChattyAppBar from './components/elements/AppBar';
import Usersearch from './components/Usersearch';

// INFO prevent back button in browser
history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL);
});

// INFO warn user before reloading
/*
window.onbeforeunload = function() {
    return "No good idea.";
};
*/

function parseCPOW(event) {
    const cpow = JSON.parse(event);

    // INFO DEBUG IT
    console.log(cpow);
    return cpow;
}

let websocket = null;
let primaryColor = teal;
let secondaryColor = blueGrey;

class Chatty extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: websocket,
            username: props.state.username,
            CPOW: props.state.CPOW,
            notify: props.state.notify,
            serviceOutput: props.state.serviceOutput,
            chat: '',
            dnmode: getDnMode(),
            menuOpen: false,
            showAbout: false,
            openContacts: false,
            showUserSearch: false,
            clickedChat: false,
            isConnected: true,
            /**
             * INFO It contains {'username': base64_image_blob}, actual type has to be updated when images are available
             * @type {[]}
             */
            foundUser: [],
            /**
             * INFO Contacts list
             * @type {[]}
             */
            contacts: [],
            /**
             * INFO Properties for the chat context
             */
            context: [
                // INFO current chat participant
                { participant: '' },
                // INFO current messages in chat
                { messages: [
                    {
                        // INFO message sender
                        sender: '',
                        content: ''
                    }]
                }]
        };

        this.openChat = this.openChat.bind(this);
        this.logout = this.logout.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    componentWillMount() {
        if(this.state.socket == null) {
            let url = sessionStorage.getItem("socketUrl");
            this.setState({socket: new ReconnectingWebSocket(url, null, {automaticOpen: true})})
        }

        const cpowTemp = this.state.CPOW;
        cpowTemp.user.username = this.state.username;

        // INFO set all contacts from user when the user logging in
        this.setState({
            contacts: this.state.CPOW.contacts,
            CPOW: cpowTemp
        });
    }

    logout = event => {

        const cpow = this.state.CPOW;
        cpow.actionType = 'USER_DISCONNECT';

        let json = JSON.stringify(cpow);
        this.state.socket.send(json);
    };

    openChat = participant => event => {
        this.setState({
            clickedChat: true,
            context: [{
                participant: participant
            }]
        });

        const cpow = this.state.CPOW;
        cpow.actionType = 'USER_CREATE_CHAT';
        cpow.participant = {
            username: participant
        };

        let json = JSON.stringify(cpow);
        this.state.socket.send(json)
    };

    sendMessage = msg => event => {
        // TODO
    };

    handleSnackbarClose = () => {
        this.setState({ notify: false });
    };

    handleContactsSubList = () => {
        this.setState({ openContacts: !this.state.openContacts });
    };

    userLookup = event => {
        let value = event.target.value;
        //let length = value.length;

        const cpow = this.state.CPOW;
        cpow.actionType = 'USER_FIND_FRIEND';
        cpow.header.additionalText = value;
        cpow.username = this.state.username;

        let json = JSON.stringify(cpow);
        this.state.socket.send(json);
    };

    submitUser = username => event => {
        if(!this.state.contacts.find((contact) => { return contact === username})) {
            // INFO add contact to local friend list
            this.setState({contacts: this.state.contacts.concat([username])});

            const cpow = this.state.CPOW;
            cpow.actionType = 'USER_ADD_FRIEND';
            cpow.header.additionalText = username;

            // INFO send request to add friend in global list
            const json = JSON.stringify(cpow);
            this.state.socket.send(json);
        }
    };

    handleCloseUserSearch = event => {
        this.setState({ showUserSearch: false })
    };

    render() {
        // Set theme
        const theme = createMuiTheme({
            palette: {
                primary: primaryColor,
                secondary: secondaryColor,
                error: red,
                type: this.state.dnmode,
            }
        });

        // Actual this is to access this.setState({})
        let self = this;

        this.state.socket.onmessage = event => {
            const CPOW = parseCPOW(event.data);

            self.setState({
                CPOW: CPOW
            });

            //INFO IMPORTANT Query results here!

            // Result of
            if(self.state.CPOW.actionType === 'USER_LOGIN_ACCOUNT') {
                self.setState({
                    notify: true,
                    serviceOutput: CPOW.header.additionalText
                });
            }

            if(CPOW.responseType === 'SUCCESS' && CPOW.actionType === 'USER_DISCONNECT') {
                this.state.socket.close();
                // Remove any session cookies!
                sessionStorage.clear();

                ReactDOM.render(
                    <InitApp dnmode={self.state.dnmode}
                             socket={null}
                             servicePath={''}
                             buttonTestDisabled={true}
                             buttonEnterDisabled={true}
                             serviceOutput={self.state.serviceOutput}
                             notify={self.state.notify}/>,
                    document.getElementById('app')
                )
            }

            if(CPOW.responseType === "SUCCESS" && CPOW.actionType === "USER_ADD_FRIEND" ) {
                self.setState({
                    notify: true,
                    serviceOutput: CPOW.header.additionalText
                });
            }

            // Result of user lookup
            if(CPOW.responseType === 'SUCCESS' && CPOW.actionType === 'USER_FIND_FRIEND') {
                // TODO Open a result dialog with the corresponding user
                self.setState({
                    showUserSearch: true,
                    foundUser: CPOW.userList
                })
            }

            if(CPOW.responseType === 'FAILURE' && CPOW.actionType === 'USER_FIND_FRIEND') {
                self.setState({
                    notify: true,
                    serviceOutput: CPOW.header.additionalText
                })
            }

            if(self.state.CPOW.responseType === 'SUCCESS' && self.state.CPOW.actionType === 'USER_CREATE_CHAT') {
                self.setState({
                    notify: true,
                    serviceOutput: self.state.CPOW.header.additionalText
                })
            }

            if(self.state.CPOW.responseType === 'FAILURE' && self.state.CPOW.actionType === 'USER_CREATE_CHAT') {
                self.setState({
                    notify: true,
                    serviceOutput: self.state.CPOW.header.additionalText
                })
            }
        };

        this.state.socket.onclose = event => {
            self.setState({
                isConnected: false
            });
        };

        this.state.socket.onopen = event => {
            self.setState({
                isConnected: true
            });
        };

        return(
            <MuiThemeProvider theme={theme}>
                <span>
                    <ChattyAppBar
                        openSubContacts={this.handleContactsSubList}
                        isContactsOpen={this.state.openContacts}
                        isConnected={this.state.isConnected}
                        logout={this.logout}
                        showAbout={() => this.setState({ showAbout: true })}
                        switchStyleOnClick={(event, checked) => {checked ?
                            this.setState({dnmode: 'dark'}) : this.setState({dnmode: 'light'})
                        }}
                        switchStyleChecked={this.state.dnmode === 'dark'}
                        openUserSearch={() => this.setState({ showUserSearch: true })}
                        openChat={this.openChat}
                        username={this.state.username}
                        contacts={this.state.contacts}
                        clickedChat={this.state.clickedChat}
                        context={this.state.context}
                    />
                    <Dialog
                        open={this.state.showAbout}
                        onRequestClose={() => this.setState({ showAbout: false })}
                        transition={Slide}>
                        <DialogTitle>Chatty information</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <b>Author</b>: {this.state.CPOW.version.author} <br/>
                                <b>Service version</b>: {this.state.CPOW.version.service} <br/>
                                <b>Client version</b>: {Version.client} <br/>
                                <b>Homepage</b>: <a href={this.state.CPOW.version.homepage} target={'_blank'}>{this.state.CPOW.version.homepage}</a> <br/>
                                <b>3rdParties</b>: {this.state.CPOW.version.thirdParties} <br/>
                                <b>License</b>: {this.state.CPOW.version.license} <br/>
                            </DialogContentText>
                        </DialogContent>
                    </Dialog>
                    <Usersearch
                        showUserSearch={this.state.showUserSearch}
                        onRequestClose={this.handleCloseUserSearch}
                        userLookup={this.userLookup}
                        foundUser={this.state.foundUser}
                        submitUser={this.submitUser}
                    />
                    <ChattySnackbar
                        open={this.state.notify}
                        onRequestClose={this.handleSnackbarClose}
                        message={this.state.serviceOutput}
                    />
                </span>
            </MuiThemeProvider>
        )
    }
}

// Chatty-client components
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: websocket,
            username: '',
            password: '',
            CPOW: null,
            serviceOutput: '',
            notify: false

        };
        this.onChange = this.onChange.bind(this);
        this.login = this.login.bind(this);
    }

    onChange = name => event => {
        // TODO validate the input!
        this.setState({
            [name]: event.target.value
        })
    };

    login (event) {
        event.preventDefault();
        if( this.state.username !== "" || this.state.password !== "") {

            if(this.state.CPOW != null) {
                const cpow = this.state.CPOW;
                cpow.actionType = 'USER_LOGIN_ACCOUNT';
                cpow.user.username = this.state.username;
                cpow.password.encrypted = encrypt(this.state.password);

                let json = JSON.stringify(cpow);
                this.state.socket.send(json)
            }else {

                const cpow = {
                    actionType: 'USER_LOGIN_ACCOUNT',
                    user: {
                        username: this.state.username
                    },
                    password: {
                        encrypted: encrypt(this.state.password)
                    }
                };

                let json = JSON.stringify(cpow);
                this.state.socket.send(json)
            }
        }
    };

    handleSnackbarClose = () => {
        this.setState({ notify: false });
    };

    render() {

        let self = this;
        this.state.socket.onmessage = event => {
            const CPOW = parseCPOW(event.data);

            self.setState({
                CPOW: CPOW
            });

            let service_output = CPOW.header.additionalText;
            self.setState({
                notify: true,
                serviceOutput: service_output
            });

            if (self.state.CPOW.responseType === "SUCCESS" && self.state.CPOW.actionType === "USER_LOGIN_ACCOUNT") {
                // Set sessionStorage for login to remember it
                sessionStorage.setItem("isAuthenticated", true);

                const state = {
                    CPOW: self.state.CPOW,
                    username: self.state.username,
                    notify: self.state.notify,
                    serviceOutput: self.state.serviceOutput
                };
                sessionStorage.setItem("state", JSON.stringify(state));

                // Render chat
                ReactDOM.render(
                    <Chatty state={self.state} />,
                    document.getElementById('app')
                );
            }
        };

        return (
            <div>
                <LoginElements
                    loginSubmit={this.login}
                    onChangeUsername={this.onChange}
                    onChangePassword={this.onChange}/>
                <ChattySnackbar
                    onRequestClose={this.handleSnackbarClose}
                    open={this.state.notify}
                    message={this.state.serviceOutput}
                />
            </div>
        )
    };
}

class Register extends React.Component {
    constructor(props) {
        super(props);

        // TODO use helperText to show validation errors
        this.state = {
            socket: websocket,
            CPOW: null,
            username: '',
            name: '',
            password: '',
            buttonDisabled: true,
            nameError: false,
            nameErrorText: '',
            usernameError: false,
            usernameErrorText: '',
            passwordErrorState: false,
            passwordErrorText: '',
            passwordError: '',
            notify: false,
            serviceMessage: ''
        };

        this.validatePasswordOnChange = this.validatePasswordOnChange.bind(this);
        this.validateUsernameOnChange = this.validateUsernameOnChange.bind(this);
        this.register = this.register.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            socket: nextProps.socket
        });
    }

    componentDidMount() {
        // Actual this to access this.setState({})
        let self = this;

        this.state.socket.onmessage = function(event) {
            let CPOW = parseCPOW(event.data);

            self.setState({
                CPOW: CPOW
            });

            // Use Snackbar to show Service information
            let serviceMessage = CPOW.header.additionalText;
            if(serviceMessage !== "") {
                self.setState({
                    notify: true,
                    serviceMessage: serviceMessage
                })
            }
        };
    }

    validateUsernameOnChange = name => event => {
        let length = event.target.value.length;
        this.setState({
            [name]: event.target.value
        });

        if (length >= this.state.CPOW.user.minimumLength) {

            this.setState({
                notify: true,
                serviceMessage: "Great name! " + event.target.value
            });

            if(this.state.password.length === this.state.CPOW.password.minimumLength) {
                this.setState({
                    buttonDisabled: false
                })
            }
        } else {

            this.setState({
                notify: true,
                serviceMessage: "Too short :( " + event.target.value,
                buttonDisabled: true
            });
        }
    };

    validatePasswordOnChange = password => event => {
        let value = event.target.value;
        let length = value.length;

        this.setState({
            [password]: value
        });

        let good = 12;
        let minimum = this.state.CPOW.password.minimumLength;
        let usermin = this.state.CPOW.user.minimumLength;

        if (length >= minimum && length < good) {

            this.setState({
                notify: true,
                serviceMessage: "Good password! " + String(good - length) + "chars left for perfect one"
            });

            if(this.state.username.length === usermin && this.state.name.length === usermin) {
                this.setState({
                    buttonDisabled: false
                });
            }else {
                if(this.state.username.length === 0) {
                    this.setState({
                        buttonDisabled: true
                    })
                }else {
                    this.setState({
                        buttonDisabled: false
                    })
                }

                if(this.state.name.length === 0) {
                    this.setState({
                        buttonDisabled: true
                    })
                }else {
                    this.setState({
                        buttonDisabled: false
                    })
                }
            }

        } else if (length >= good) {

            this.setState({
                notify: true,
                serviceMessage: "Perfect password!"
            });

            if(this.state.username.length === usermin && this.state.name.length === usermin) {
                this.setState({
                    buttonDisabled: false
                });
            }else {
                if(this.state.username.length === 0) {
                    this.setState({
                        buttonDisabled: true
                    })
                }else {
                    this.setState({
                        buttonDisabled: false
                    })
                }

                if(this.state.name.length === 0) {
                    this.setState({
                        buttonDisabled: true
                    })
                }else {
                    this.setState({
                        buttonDisabled: false
                    })
                }
            }
        } else {
            this.setState({
                notify: true,
                serviceMessage: "Too weak! :( " + String(minimum - length) + " left! ",
                buttonDisabled: true
            });
        }
    };

    register (event) {
        event.preventDefault();
        if( this.state.username.length !== 0 || this.state.name.length !== 0 || this.state.password.length !== 0) {

            if(this.state.CPOW != null) {
                const cpow = this.state.CPOW;
                cpow.actionType = 'USER_REGISTER_ACCOUNT';
                cpow.user.username = this.state.username;
                cpow.user.name = this.state.name;
                cpow.password.encrypted = encrypt(this.state.password);

                let json = JSON.stringify(cpow);
                this.state.socket.send(json);
            }
        }else {
            this.setState({
                notify: true,
                serviceMessage: "Could not send registration to service!",
                buttonDisabled: true
            });
        }
    };

    handleSnackbarClose = () => {
        this.setState({ notify: false });
    };

    render() {
        return (
            <div>
                <RegisterElements
                    registerSubmit={this.register}
                    validateUsernameOnChange={this.validateUsernameOnChange}
                    validatePasswordOnChange={this.validatePasswordOnChange}
                    buttonRegisterDisabled={this.state.buttonDisabled}
                    displyNameErrorState={this.state.nameError}
                    displayNameErrorText={this.state.nameErrorText}
                    usernameErrorState={this.state.usernameError}
                    usernameErrorText={this.state.usernameErrorText}
                    passwordErrorState={this.state.passwordError}
                    passwordErrorText={this.state.passwordErrorText}
                    passwordInputValue={this.state.password}
                />
                <ChattySnackbar
                    onRequestClose={this.handleSnackbarClose}
                    open={this.state.notify}
                    message={this.state.serviceMessage}
                />
            </div>
        )
    }
}

export class Auth extends React.Component {
    constructor(props) {
        super(props);
        sessionStorage.setItem("socketUrl", props.address);
        websocket = new ReconnectingWebSocket(props.address, null, {automaticOpen: true});

        this.state = {
            socket: websocket,
            serviceOutput: '',
            dnmode: props.dnmode
        };
    }

    componentWillMount() {
        // Actual this to access this.setState({})
        let self = this;

        let enableClientOnService = {
            actionType: "USER_CONNECT"
        };

        // Create websocket connection
        this.state.socket.open();
        this.state.socket.onopen = function (event) {
            let message = JSON.stringify(enableClientOnService);
            self.state.socket.send(message)
        };

        this.state.socket.onclose = function () {
            self.setState({
                serviceOutput: "[chatty-client]: Connection is closed by service."
            });
        };

        this.state.socket.onmessage = function(event) {
            let CPOW = parseCPOW(event.data);

            self.setState({
                CPOW: CPOW
            });

            let service_output = CPOW.header.additionalText;
            self.setState({
                serviceOutput: service_output
            })
        };
    }

    render() {
        const theme = createMuiTheme({
            palette: {
                primary: primaryColor,
                secondary: secondaryColor,
                error: red,
                type: this.state.dnmode
            }
        });

        return (
            <MuiThemeProvider theme={theme}>
                <span>
                    <Header/>
                    <div>
                        <Login socket={this.state.socket} />
                    </div>
                    <div>
                        <Register socket={this.state.socket}/>
                    </div>
                </span>
            </MuiThemeProvider>
        );
    }
}

export class InitApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: props.socket,
            servicePath: props.servicePath,
            buttonEnterDisabled: props.buttonEnterDisabled,
            buttonTestDisabled: props.buttonTestDisabled,
            serviceOutput: props.serviceOutput,
            notify: props.notify,
            dnmode: props.dnmode
        };

        this.addServiceAddress = this.addServiceAddress.bind(this);
        this.addInternally = this.addInternally.bind(this);
        this.testConnection = this.testConnection.bind(this);
    }

    addServiceAddress(event) {
        if(this.state.socket !== null) {
            this.state.socket.close();
        }

        ReactDOM.render(
            <Auth address={this.state.servicePath} dnmode={this.state.dnmode}/>,
            document.getElementById('app')
        );
    };

    testConnection() {
        let self = this;
        let _socket = null;
        try {
            _socket = new WebSocket(this.state.servicePath);
        }catch(err) {
            this.setState({
                buttonEnterDisabled: true,
                buttonTestDisabled: true,
                serviceOutput: 'This seems not to be a valid service! :('
            })
        }

        this.setState({
            socket:  _socket
        });

        _socket.onopen = function () {
            let message = JSON.stringify({
                "actionType": "USER_CONNECT"
            });
            self.state.socket.send(message)
        };

        _socket.onmessage = function (event) {
            let CPOW = parseCPOW(event.data);
            if(CPOW) {
                self.setState({
                    buttonEnterDisabled: false,
                    socket: _socket,
                    serviceOutput: 'Nice! It is a valid service! :)',
                    notify: true
                })
            }
        };

        _socket.onerror = function () {
            self.setState({
                buttonEnterDisabled: true,
                serviceOutput: 'This seems not to be a valid service! :(',
                notify: true
            })
        };
    }

    addInternally(event) {
        let value = event.target.value;
        // ws://
        if(value.length > 5) {
            this.setState({
                buttonTestDisabled: false,
                servicePath: value
            });
        }else {
            this.setState({
                buttonTestDisabled: true,
                servicePath: value
            });
        }
    }

    handleSnackbarClose = () => {
        this.setState({notify: false});
    };

    render() {

        const theme = createMuiTheme({
            palette: {
                primary: primaryColor,
                secondary: secondaryColor,
                error: red,
                type: this.state.dnmode
            }
        });

        return (
            <MuiThemeProvider theme={theme}>
                <span>
                    <Header/>
                    <Service
                        addInternally={this.addInternally}
                        buttonTestDisabled={this.state.buttonTestDisabled}
                        testConnection={this.testConnection}
                        buttonEnterDisabled={this.state.buttonEnterDisabled}
                        addServiceAddress={this.addServiceAddress}
                    />
                    <ChattySnackbar
                        onRequestClose={this.handleSnackbarClose}
                        open={this.state.notify}
                        message={this.state.serviceOutput}
                    />
                </span>
            </MuiThemeProvider>
        );
    }
}

if(sessionStorage.getItem("isAuthenticated")) {
    let state = JSON.parse(sessionStorage.getItem("state"));

    // Render chat from web session
    ReactDOM.render(
        <Chatty state={state} />,
        document.getElementById('app')
    );
}else {
    ReactDOM.render(
        <InitApp
            socket={null}
            servicePath=''
            buttonTestDisabled={true}
            buttonEnterDisabled={true}
            serviceOutput={'Welcome to Chatty!'}
            notify={true}
            dnmode={getDnMode()}
        />,
        document.getElementById('app')
    );
}