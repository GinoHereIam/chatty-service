// Styles
import "./style.css";
import 'typeface-roboto'
// Material-ui
import { teal, blueGrey, red, blue } from 'material-ui/colors'

import {
    FormControlLabel, AppBar, Drawer, Input,
    Card, CardActions, CardContent, CardHeader, CardMedia, Button,
    ButtonBase, MuiThemeProvider, withTheme, Paper, Switch, TextField, Typography, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, List, ListItem, ListItemAvatar, Avatar, ListItemText
} from 'material-ui';
import { createMuiTheme } from 'material-ui'
import Slide from "material-ui/transitions/Slide"

// React
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Websocket
import ReconnectingWebSocket from "./vendor/reconnecting-websocket.min";

// Own Components
import ChattySnackbar from "./components/elements/Snackbar";
import Header from "./components/elements/Header";
import Service from "./components/Init"
import RegisterElements from "./components/Register"
import LoginElements from "./components/Login"
import Chat from "./components/Chat"
import {getDnMode} from "./util/dnmode"
import ChattyAppBar from './components/elements/AppBar'
import Userearch from './components/Usersearch'

// Functions
function parseCPOW(event) {
    // Expect server event data
    let CPOW = JSON.parse(event);

    // DEBUG
    // console.log(CPOW);

    const version = {
        author: CPOW[0].version[0].author,
        service: CPOW[0].version[1].service,
        client: CPOW[0].version[2].client,
        homepage: CPOW[0].version[3].homepage,
        license: CPOW[0].version[4].license,
        thirdParties: CPOW[0].version[5].thirdParties
    };
    const actionType = CPOW[1].actionType;
    const message = {
        timestamp: CPOW[2].message[1],
        content: CPOW[2].message[0]
    };

    const header = {
        additionalText: CPOW[3].header[0].additionalText
    };

    const responseType = CPOW[4].responseType;
    const user = {
        username: CPOW[5].user[0].username,
        name: CPOW[5].user[1].name,
        token: CPOW[5].user[2].token,
        minimumLength: CPOW[5].user[3].minimumLength
    };

    // CPOW[6] doesn't matter for now

    const chats = {
        chatIDs: CPOW[7].chats[0].chatIDs
    };

    const password = {
        minimumLength: CPOW[8].password[0].minimumLength
    };

    const userList = CPOW[9].userList;

    return {
        version: version,
        actionType: actionType,
        message: message,
        header: header,
        responseType: responseType,
        user: user,
        chats: chats,
        password: password,
        userList: userList
    };
}

let websocket = null;

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
            /**
             * It contains {'username': base64_image_blob}, actual type has to be updated when images are available
             * @type {[]}
             */
            foundUser: [],
            /**
             * Contacts list
             */
            contacts: []
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
    }

    logout = event => {
        let CPOW = {
            actionType: 'USER_DISCONNECT'
        };

        let cpow = JSON.stringify(CPOW);
        this.state.socket.send(cpow);
    };

    openChat = event => {
        //let targetName = event.target.parentNode.classList[1];
        //let targetName = event.target.name;
        //console.log('Open chat target: ' + targetName);

        // Get messages
        let messages = document.getElementsByClassName('messages');
        messages.innerHTML = 'Your last dummy messages from John Doe!'
    };

    sendMessage = event => {
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

        let findAFriendObj = {
            username: this.state.username,
            actionType: "USER_FIND_FRIEND",
            header: value
        };

        let json = JSON.stringify(findAFriendObj);

        this.state.socket.send(json);
    };

    submitUser = name => event => {
        if(!this.state.contacts.find((contact) => { return contact === name})) {
            this.setState({contacts: this.state.contacts.concat([name])})
        }
    };

    handleCloseUserSearch = event => {
        this.setState({ showUserSearch: false })
    };

    render() {
        // Set theme
        const theme = createMuiTheme({
            palette: {
                primary: teal,
                secondary: blueGrey,
                error: red,
                type: this.state.dnmode,
            }
        });

        // Actual this to access this.setState({})
        let self = this;

        this.state.socket.onmessage = event => {
            let CPOW = parseCPOW(event.data);

            self.setState({
                CPOW: CPOW
            });

            //IMPORTANT Query results here!

            // Result of
            if(self.state.CPOW.actionType === 'USER_LOGIN_ACCOUNT') {
                self.setState({
                    notify: true,
                    serviceOutput: CPOW.header.additionalText
                });
            }

            if(self.state.CPOW.responseType === 'SUCCESS' && self.state.CPOW.actionType === 'USER_DISCONNECT') {
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

            // Result of user lookup
            if(self.state.CPOW.responseType === 'SUCCESS' && self.state.CPOW.actionType === 'USER_FIND_FRIEND') {
                // TODO Open a result dialog with the corresponding user
                console.log('User search result');
                console.log(self.state.CPOW.userList);

                self.setState({
                    showUserSearch: true,
                    foundUser: self.state.CPOW.userList
                })
            }

            if(self.state.CPOW.responseType === 'FAILURE' && self.state.CPOW.actionType === 'USER_FIND_FRIEND') {
                self.setState({
                    notify: true,
                    serviceOutput: 'Something bad happen while searching for user! :('
                })
            }
        };

        this.state.socket.onclose = event =>{
            self.setState({
                notify: true,
                serviceOutput: 'No connection to service.'
            });
        };

        this.state.socket.onopen = event =>{
            self.setState({
                notify: true,
                serviceOutput: 'Reconnected to service.'
            });
        };

        return(
            <MuiThemeProvider theme={theme}>
                <span>
                    <ChattyAppBar
                        openSubContacts={this.handleContactsSubList}
                        isContactsOpen={this.state.openContacts}
                        logout={this.logout}
                        showAbout={() => this.setState({ showAbout: true })}
                        switchStyleOnClick={(event, checked) => {checked ?
                            this.setState({dnmode: 'dark'}) : this.setState({dnmode: 'light'})
                        }}
                        switchStyleChecked={this.state.dnmode === 'dark'}
                        openUserSearch={() => this.setState({ showUserSearch: true })}
                        username={this.state.username}
                        contacts={this.state.contacts}
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
                                <b>Client version</b>: {this.state.CPOW.version.client} <br/>
                                <b>Homepage</b>: <a href={this.state.CPOW.version.homepage} target={'_blank'}>{this.state.CPOW.version.homepage}</a> <br/>
                                <b>3rdParties</b>: {this.state.CPOW.version.thirdParties} <br/>
                                <b>License</b>: {this.state.CPOW.version.license} <br/>
                            </DialogContentText>
                        </DialogContent>
                    </Dialog>
                    <Userearch
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
            CPOW: '',
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

            let loginObj = {
                actionType: "USER_LOGIN_ACCOUNT",
                username: this.state.username,
                password: this.state.password
            };

            let json = JSON.stringify(loginObj);
            this.state.socket.send(json)
        }
    };

    handleSnackbarClose = () => {
        this.setState({ notify: false });
    };

    render() {

        let self = this;
        this.state.socket.onmessage = event => {
            let CPOW = parseCPOW(event.data);

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
                }
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
            let registerObj = {
                actionType: "USER_REGISTER_ACCOUNT",
                name: this.state.name,
                username: this.state.username,
                password: this.state.password
            };
            let json = JSON.stringify(registerObj);
            this.state.socket.send(json);
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
            //console.log('open:', event);
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
                primary: teal,
                secondary: blueGrey,
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
            //console.log('open:', event);
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
                primary: teal,
                secondary: blueGrey,
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