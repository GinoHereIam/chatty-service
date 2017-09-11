// Styles
import "./style.css";
import "../node_modules/bulma/css/bulma.css"
import {
    Container, Button, Title, Label, Input, Tile, Content, Image, Textarea, Card,
    CardContent, CardImage, CardHeader, CardHeaderTitle, CardFooter, CardFooterItem, Nav, NavGroup, NavItem, NavToggle,
    Hero, HeroBody, Subtitle, Section, FormHorizontal, ControlLabel, Group, Box, Notification, Modal
} from "re-bulma";
// React
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Websocket
import ReconnectingWebSocket from "./vendor/reconnecting-websocket.min";
// Insert bulma stylesheet
import insertCss from 'insert-css';
import css from '../node_modules/re-bulma/build/css';
try {
    if (typeof document !== 'undefined' || document !== null) insertCss(css, { prepend: true });
} catch (e) {}

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
                <Tile className='Navbar' context='isAncestor'>
                    <Tile isVertical size='is12'>
                        <Nav hasShadow style={navigation}>
                            <NavGroup align='left'>
                                <NavItem>
                                    <strong>Hi {this.state.CPOW.user.name}!</strong>
                                </NavItem>
                            </NavGroup>
                            <NavGroup align='center'>
                                <NavItem>
                                    <Button color='isInfo' onClick={() => this.setState({ showAbout: true })}>Your Chatty!</Button>
                                </NavItem>
                            </NavGroup>
                            <NavToggle/>
                            <NavGroup align='right' isMenu>
                                <NavItem>
                                    <Input type='search' placeholder='User search ...'/>
                                </NavItem>
                                <NavItem>
                                    <Button color='isPrimary' onClick={this.logout}>
                                        <i className='material-icons'>exit_to_app</i>Logout
                                    </Button>
                                </NavItem>
                            </NavGroup>
                        </Nav>
                    </Tile>
                </Tile>
                <Tile className="chat" context="isAncestor" style={app}>
                    <Tile isVertical size="is10">
                        <Tile>
                            <Tile context="isParent">
                                <Tile context="isChild" style={messages}>
                                    <Content className="messages"/>
                                </Tile>
                            </Tile>
                        </Tile>
                        <Tile context="isParent" className="msgbox">
                            <Textarea style={msgbox}/>
                        </Tile>
                    </Tile>
                    <Tile context="isParent">
                        <Tile context="isChild" size='is10' style={contacts}>
                            <Card style={contactCard}>
                                <CardHeader>
                                    <CardHeaderTitle>John Doe</CardHeaderTitle>
                                </CardHeader>
                                <CardImage>
                                    <Image/>
                                </CardImage>
                                <CardContent>
                                    <Content>Your last dummy messages from John Doe!</Content>
                                </CardContent>
                                <CardFooter>
                                    <CardFooterItem>
                                        <Button color="isPrimary" onClick={this.openChat}>Open</Button>
                                    </CardFooterItem>
                                </CardFooter>
                            </Card>
                            <Card style={contactCard}>
                                <CardHeader>
                                    <CardHeaderTitle>Jane Doe</CardHeaderTitle>
                                </CardHeader>
                                <CardImage>
                                    <Image/>
                                </CardImage>
                                <CardContent>
                                    <Content>Your last dummy messages from Miles Doe!</Content>
                                </CardContent>
                                <CardFooter>
                                    <CardFooterItem>
                                        <Button color="isPrimary" onClick={this.openChat}>Open</Button>
                                    </CardFooterItem>
                                </CardFooter>
                            </Card>
                        </Tile>
                    </Tile>
                </Tile>
                <Modal
                    type="card"
                    headerContent="Chatty information"
                    isActive={this.state.showAbout}
                    onCloseRequest={() => this.setState({ showAbout: false })}>
                    <Content>
                        <b>Author</b>: {this.state.CPOW.version.author} <br/>
                        <b>Service version</b>: {this.state.CPOW.version.service} <br/>
                        <b>Client version</b>: {this.state.CPOW.version.client} <br/>
                        <b>Homepage</b>: {this.state.CPOW.version.homepage} <br/>
                        <b>3rdParties</b>: {this.state.CPOW.version.thirdParties} <br/>
                        <b>License</b>: {this.state.CPOW.version.license} <br/>
                    </Content>
                </Modal>
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
            serviceOutput: props.serviceOutput
        };
        this.onChange = this.onChange.bind(this);
        this.login = this.login.bind(this);
    }

    onChange(event) {
        let targetName = event.target.parentNode.classList[1];
        this.setState({
            [targetName]: event.target.value
        })
    }

    login (event) {
        event.preventDefault();
        if( this.state.username !== "" || this.state.password !== "") {
            let json = JSON.stringify({
                "actionType": "USER_LOGIN_ACCOUNT",
                "username": this.state.username,
                "password": this.state.password,
                "content": "",
            });
            this.state.socket.send(json)
        }
    };

    render() {
        let self = this;
        this.state.socket.onmessage = function(event) {
            let CPOW = parseCPOW(event.data);

            self.setState({
                CPOW: CPOW
            });

            let service_output = CPOW.header.additionalText;
            self.setState({
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
                <Container>
                    <Title size="is4">Login</Title>
                    <form onSubmit={this.login}>
                        <Label>Username:</Label>
                        <Input className="username" color='isInfo' onChange={this.onChange}/>
                        <Label>Password:</Label>
                        <Input className="password" color='isInfo' onChange={this.onChange} type="password"/>
                        <Button color="isPrimary" type="submit">Login</Button>
                    </form>
                </Container>
            </div>
        )
    };
}

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: props.socket,
            username: '',
            name: '',
            password: '',
            button: 'isDisabled',
            inputname: 'isInfo',
            inputusername: 'isInfo',
            CPOW: null,
            serviceOutput: props.serviceOutput
        };

        this.validatePasswordOnChange = this.validatePasswordOnChange.bind(this);
        this.validateUsernameOnChange = this.validateUsernameOnChange.bind(this);
        this.register = this.register.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            socket: nextProps.socket,
            serviceOutput: nextProps.serviceOutput
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

            let service_output = CPOW.header.additionalText;
            self.setState({
                serviceOutput: service_output
            });

        };
    }

    validateUsernameOnChange(event) {
        let length = event.target.value.length;
        let validate_field = document.getElementById('validate');
        let targetName = event.target.parentNode.classList[1];

        this.setState({
            [targetName]: event.target.value
        });

        if (length >= this.state.CPOW.user.minimumLength) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #4caf50; font-weight: bold;">' +
                '<br>Great name! ' + event.target.value + '</br></span>';

            if(this.state.password.length === this.state.CPOW.password.minimumLength) {
                this.setState({
                    button: "isActive"
                })
            }

        } else {

            // Validation output
            validate_field.innerHTML = '<span style="color: #f44336; font-weight: bold;">' +
                '<br>Too short :( ' + event.target.value + '</br></span>';
            this.setState({
                button: "isDisabled"
            })
        }
    }

    validatePasswordOnChange(event) {
        let value = event.target.value;
        let length = value.length;
        let targetName = event.target.parentNode.classList[1];

        this.setState({
            [targetName]: value
        });

        let validate_field = document.getElementById('validate');

        let good = 12;
        let minimum = this.state.CPOW.password.minimumLength;
        let usermin = this.state.CPOW.user.minimumLength;

        if (length >= minimum && length < good) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #4caf50; font-weight: bold;">' +
                '<br>Good password! ' + String(good - length) + ' chars left for perfect one!</br></span>';

            if(this.state.username.length === usermin && this.state.name.length === usermin) {
                this.setState({
                    button: "isActive"
                });
            }else {
                if(this.state.username.length === 0) {
                    this.setState({
                        inputusername: 'isDanger',
                        button: 'isDisabled'
                    })
                }else {
                    this.setState({
                        inputusername: 'isSuccess',
                        button: 'isActive'
                    })
                }

                if(this.state.name.length === 0) {
                    this.setState({
                        inputname: 'isDanger',
                        button: 'isDisabled'
                    })
                }else {
                    this.setState({
                        inputname: 'isSuccess',
                        button: 'isActive'
                    })
                }
            }

        } else if (length >= good) {
            // Validation output
            validate_field.innerHTML = '<span style="color: #4caf50; font-weight: bold;"><br>Perfect one!</br></span>';

            if(this.state.username.length === usermin && this.state.name.length === usermin) {
                this.setState({
                    button: "isActive"
                });
            }else {
                if(this.state.username.length === 0) {
                    this.setState({
                        inputusername: 'isDanger',
                        button: 'isDisabled'
                    })
                }else {
                    this.setState({
                        inputusername: 'isSuccess',
                        button: 'isActive'
                    })
                }

                if(this.state.name.length === 0) {
                    this.setState({
                        inputname: 'isDanger',
                        button: 'isDisabled'
                    })
                }else {
                    this.setState({
                        inputname: 'isSuccess',
                        button: 'isActive'
                    })
                }
            }
        } else {
            // Validation output
            validate_field.innerHTML = '<span style="color: #f44336; font-weight: bold;">' +
                '<br>Too weak :( ' + String(minimum - length) + ' left!</br></span>';
            this.setState({
                button: "isDisabled"
            })
        }
    }

    register (event) {
        event.preventDefault();
        if( this.state.username.length !== 0 || this.state.name.length !== 0 || this.state.password.length !== 0) {
            this.state.socket.send(JSON.stringify({
                "actionType": "USER_REGISTER_ACCOUNT",
                "name": this.state.name,
                "username": this.state.username,
                "password": this.state.password,
                "content": "",
                "token": ""
            }));
        }else {
            return null
        }
    };

    render() {
        return (
            <div>
                <Container>
                    <Title size="is4">Register</Title>
                    <form onSubmit={this.register}>
                        <Label>Username:</Label>
                        <Input className="username"
                               onChange={this.validateUsernameOnChange}
                               color={this.state.inputusername}/>
                        <Label>Display name:</Label>
                        <Input className="name"
                               onChange={this.validateUsernameOnChange}
                               color={this.state.inputname}/>
                        <Label>Password:</Label><p/>
                        <Input className="password"
                               color="isPrimary"
                               onChange={this.validatePasswordOnChange}
                               type="password">{this.state.password}</Input>
                        <span id="validate"/>
                        <Button color="isInfo"
                                state={this.state.button}
                                type="submit"
                                className="submitBtn">Register</Button>
                    </form>
                </Container>
            </div>
        )
    }
}

export class Auth extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: new ReconnectingWebSocket(props.address, null, {automaticOpen: false}),
            serviceOutput: ''
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
        return (
            <span>
                <Hero color='isPrimary' size='isMedium'>
                    <HeroBody>
                        <Container>
                            <Title>Chatty</Title>
                            <Subtitle>Your own communication channel! Your own cloud chat service!</Subtitle>
                        </Container>
                    </HeroBody>
                </Hero>
                <Box>
                    <Login socket={this.state.socket} />
                </Box>
                <Box>
                    <Register socket={this.state.socket}/>
                </Box>
            </span>
        );
    }
}

export class InitApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: null,
            servicePath: '',
            buttonEnter: 'isDisabled',
            buttonTest: 'isDisabled',
            serviceInputStyle: {
                display: 'block'
            },
            validateService: ''
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
            <Auth address={this.state.servicePath}/>,
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
                buttonEnter: 'isDisabled',
                buttonTest: 'isDisabled',
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
                    buttonEnter: 'isActive',
                    socket: _socket,
                    validateService: 'Nice! It is a valid service! :)'
                })
            }
        };

        _socket.onerror = function () {
            self.setState({
                buttonEnter: 'isDisabled',
                validateService: 'This seems not to be a valid service! :('
            })
        };
    }

    addInternally(event) {
        let value = event.target.value;
        // ws://
        if(value.length > 5) {
            this.setState({
                buttonTest: 'isActive',
                servicePath: value
            });
        }else {
            this.setState({
                buttonTest: 'isDisabled',
                servicePath: value
            });
        }
    };

    render() {
        return (
            <div>
                <Hero color='isPrimary' size='isMedium'>
                    <HeroBody>
                        <Container>
                            <Title>Chatty</Title>
                            <Subtitle>Your own communication channel! Your own cloud chat service!</Subtitle>
                        </Container>
                    </HeroBody>
                </Hero>
                <Section hasTextCentered style={this.state.serviceInputStyle}>
                    <Container>
                        <Title>Service Address</Title>
                        <Group>
                            <Input type='text' onChange={this.addInternally} placeholder='ws://localhost:8080/chatty'/>
                            <Button color='isPrimary' state={this.state.buttonTest} onClick={this.testConnection}>
                                <i className='material-icons'>dns</i>
                                Verify
                            </Button>
                            <Button color='isPrimary' state={this.state.buttonEnter}
                                    onClick={this.addServiceAddress}>
                                <i className='material-icons'>launch</i>Enter
                            </Button>
                        </Group>
                        <span>{this.state.validateService}</span>
                    </Container>
                </Section>
            </div>
        );
    }
}

ReactDOM.render(
    <InitApp/>,
    document.getElementById('app')
);
