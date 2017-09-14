// Styles
import "./style.css";
import 'typeface-roboto'
// Material-ui
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { teal, grey, red } from 'material-ui/colors'

import Button from 'material-ui/Button'
import ButtonBase from 'material-ui/ButtonBase'
import { Card, CardActions,
    CardContent, CardHeader, CardMedia } from 'material-ui/Card'
import { AppBar } from 'material-ui/AppBar'
import { Drawer } from 'material-ui/Drawer'
import Input from 'material-ui/TextField'
// Useful for notification!
import Snackbar from 'material-ui/Snackbar'
import Slide from 'material-ui/transitions/Slide';
import Dialog, {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from 'material-ui/Dialog';
import Typography from 'material-ui/Typography';
import {Paper, TextField} from "material-ui";

// React
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Websocket
import ReconnectingWebSocket from "./vendor/reconnecting-websocket.min";

// Own Components
import ChattyHeader from "./components/ChattyHeader";
import Service from "./components/InitComponent"
import RegisterElements from "./components/Register"
import LoginElements from "./components/Login"

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
        sessionID: CPOW[5].user[0].sessionID,
        username: CPOW[5].user[1].username,
        name: CPOW[5].user[2].name,
        token: CPOW[5].user[3].token,
        minimumLength: CPOW[5].user[4].minimumLength
    };

    // CPOW[6] doesn't matter for now

    const chats = {
        chatIDs: CPOW[7].chats[0].chatIDs
    };

    const password = {
        minimumLength: CPOW[8].password[0].minimumLength
    };

    return {
        version: version,
        actionType: actionType,
        message: message,
        header: header,
        responseType: responseType,
        user: user,
        chats: chats,
        password: password
    };
}

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: props.socket,
            CPOW: props.CPOW,
            notify: '',
            chat: ''
        };

        console.log(this.state.CPOW);

        this.openChat = this.openChat.bind(this);
        this.logout = this.logout.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    logout() {
        let CPOW = {
            actionType: 'USER_DISCONNECT'
        };

        let serialized = JSON.stringify(CPOW);
        console.log(serialized);
        this.state.socket.send(serialized);
    }

    openChat(event) {
        //let targetName = event.target.parentNode.classList[1];
        //let targetName = event.target.name;
        //console.log('Open chat target: ' + targetName);

        // Get messages
        let messages = document.getElementsByClassName('messages');
        messages.innerHTML = 'Your last dummy messages from John Doe!'
    };

    sendMessage(event) {

    }

    render() {
        // Actual this to access this.setState({})
        let self = this;

        this.state.socket.onmessage = function(event) {
            let CPOW = parseCPOW(event.data);

            //console.log(CPOW);

            self.setState({
                CPOW: CPOW
            });

            let service_output = CPOW.header.additionalText;
            console.log(service_output);
            //document.getElementById('service_output').innerHTML += service_output + "<br/>";

            if(CPOW.responseType === 'SUCCESS' && CPOW.actionType === 'USER_DISCONNECT') {
                // Redirect to start page
                window.location.replace('/');
            }
        };

        const app = {
            height: '100%',
            width: '100%',
            margin: '0',
            padding: '0'
        };

        const messages = {
            //background: '#eee',
            background: 'white',
            borderRadius: '5px',
            padding: '1%'
        };

        const contacts = {
            background: '#eee',
            //background: 'white',
            borderRadius: '5px',
            padding: '2%'
        };

        const contactCard = {
            margin: '3% 0',
            padding: '1% 0',
            borderRadius: '5px'
        };

        const msgbox = {
            width: '100%'
        };

        const navigation = {
            top: '0',
            left: '0',
            width: '100%',
            margin: '0',
            padding: ' .5% 2%'
        };

        return(
            <div>
                <div className='navbar'>
                    <nav>
                        <ul>
                            <li>
                                <strong>Hi {this.state.CPOW.user.name}!</strong>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                <Button color='isInfo' onClick={() => this.setState({ showAbout: true })}>Your Chatty!</Button>
                            </li>
                        </ul>
                        <Button/>
                        <ul>
                            <li>
                                <Input type='search' placeholder='User search ...'/>
                            </li>
                            <li>
                                <Button color='isPrimary' onClick={this.logout}>
                                    <i className='material-icons'>exit_to_app</i>Logout
                                </Button>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="chat" style={app}>
                    <div className='messages'>

                    </div>
                    <div className='contacts'>

                    </div>
                </div>
                <Dialog
                    onCloseRequest={() => this.setState({ showAbout: false })}>
                    <DialogTitle>Chatty information</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <b>Author</b>: {this.state.CPOW.version.author} <br/>
                            <b>Service version</b>: {this.state.CPOW.version.service} <br/>
                            <b>Client version</b>: {this.state.CPOW.version.client} <br/>
                            <b>Homepage</b>: {this.state.CPOW.version.homepage} <br/>
                            <b>3rdParties</b>: {this.state.CPOW.version.thirdParties} <br/>
                            <b>License</b>: {this.state.CPOW.version.license} <br/>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

// Chatty-client components
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: props.socket,
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
                let body = document.body;

                // Remove Everything!
                while(body.firstChild) {
                    body.removeChild(body.firstChild)
                }

                // Add back the app class
                let span = document.createElement('span');
                span.id = 'app';

                body.appendChild(span);

                // Render chat
                ReactDOM.render(
                    <Chat socket={self.state.socket} CPOW={self.state.CPOW} />,
                    document.getElementById('app')
                )
            }
        };

        return (
            <div>
                <LoginElements
                    loginSubmit={this.login}
                    onChangeUsername={this.onChange}
                    onChangePassword={this.onChange}/>
                <Snackbar
                    open={this.state.notify}
                    onRequestClose={this.handleSnackbarClose}
                    transition={<Slide direction='up' />}
                    SnackbarContentProps={{
                        'aria-describedby': 'service-message',
                    }}
                    message={<span id='service-message'>{this.state.serviceOutput}</span>}
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
            socket: props.socket,
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
                <Snackbar
                    open={this.state.notify}
                    onRequestClose={this.handleSnackbarClose}
                    transition={<Slide direction='up' />}
                    SnackbarContentProps={{
                        'aria-describedby': 'service-message',
                    }}
                    message={<span id='service-message'>{this.state.serviceMessage}</span>}
                />
            </div>
        )
    }
}

export class Auth extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: new ReconnectingWebSocket(props.address, null, {automaticOpen: false}),
            serviceOutput: '',
            dnmode: props.dnmode
        };
    }

    componentWillMount() {
        // Actual this to access this.setState({})
        let self = this;

        this.state.socket.open();
        this.state.socket.onopen = function (event) {
            let message = JSON.stringify({
                "actionType": "USER_CONNECT",
                "username": "",
                "name": "",
                "password": "",
                "content": "",
                "token": ""
            });
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
                secondary: grey,
                error: red,
                type: this.state.dnmode
            }
        });

        return (
            <MuiThemeProvider theme={theme}>
                <span>
                    <ChattyHeader/>
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
            socket: null,
            servicePath: '',
            buttonEnter: true,
            buttonTest: true,
            serviceInputStyle: {
                display: 'block'
            },
            validateService: '',
            notify: false,
            dnmode: props.dnmode
        };

        this.addServiceAddress = this.addServiceAddress.bind(this);
        this.addInternally = this.addInternally.bind(this);
        this.testConnection = this.testConnection.bind(this);
    }

    addServiceAddress(event) {
        if(this.state.socket !== null) {
            this.state.socket.close();
            this.setState({
                serviceInputStyle: 'hidden'
            });
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
                buttonEnter: true,
                buttonTest: true,
                validateService: 'This seems not to be a valid service! :('
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
                    buttonEnter: false,
                    socket: _socket,
                    validateService: 'Nice! It is a valid service! :)',
                    notify: true
                })
            }
        };

        _socket.onerror = function () {
            self.setState({
                buttonEnter: true,
                validateService: 'This seems not to be a valid service! :(',
                notify: true
            })
        };
    }

    addInternally(event) {
        let value = event.target.value;
        // ws://
        if(value.length > 5) {
            this.setState({
                buttonTest: false,
                servicePath: value
            });
        }else {
            this.setState({
                buttonTest: true,
                servicePath: value
            });
        }
    }

    handleSnackbarClose = () => {
        this.setState({ notify: false });
    };

    render() {

        const theme = createMuiTheme({
            palette: {
                primary: teal,
                secondary: grey,
                error: red,
                type: this.state.dnmode
            }
        });

        return (
            <MuiThemeProvider theme={theme}>
                <span>
                    <ChattyHeader/>
                    <Service
                        addInternally={this.addInternally}
                        stateVerificationButton={this.state.buttonTest}
                        testConnection={this.testConnection}
                        stateEnterButton={this.state.buttonEnter}
                        addServiceAddress={this.addServiceAddress}
                    />
                    <Snackbar
                        open={this.state.notify}
                        onRequestClose={this.handleSnackbarClose}
                        transition={<Slide direction='up' />}
                        SnackbarContentProps={{
                            'aria-describedby': 'validate-service',
                        }}
                        message={<span id='validate-service'>{this.state.validateService}</span>}
                    />
                </span>
            </MuiThemeProvider>
        );
    }
}

ReactDOM.render(
    <InitApp dnmode='light'/>,
    document.getElementById('app')
);
