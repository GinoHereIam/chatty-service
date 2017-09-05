// Styles
import "./style.css";
import "../node_modules/bulma/css/bulma.css"
import {
    Container, Button, Title, Label, Input, Tile, Content, Image, Textarea, Card,
    CardContent, CardImage, CardHeader, CardHeaderTitle, CardFooter, CardFooterItem, Nav, NavGroup, NavItem, NavToggle,
    Hero, HeroBody, Subtitle, Section, FormHorizontal, ControlLabel, Group, Box, Notification
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
    let cpow = JSON.parse(event);

    // DEBUG
    // console.log(cpow);

    const version = cpow[0].version;
    const actionType = cpow[1].actionType;
    const message = {
        timestamp: cpow[2].message[1],
        content: cpow[2].message[0]
    };

    const header = {
        additionalText: cpow[3].header[0].additionalText
    };

    const responseType = cpow[4].responseType;
    const user = {
        sessionID: cpow[5].user[0].sessionID,
        username: cpow[5].user[1].username,
        name: cpow[5].user[2].name,
        token: cpow[5].user[3].token,
        minimumLength: cpow[5].user[4].minimumLength
    };

    // CPOW[6] doesn't matter for now

    const chats = {
        chatIDs: cpow[7].chats[0].chatIDs
    };

    const password = {
        minimumLength: cpow[8].password[0].minimumLength
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
            cpow: props.cpow,
            notify: '',
            chat: ''
        };

        this.openChat = this.openChat.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ socket: nextProps.socket });
    }

    componentDidMount() {
        // Actual this to access this.setState({})
        let self = this;

        this.state.socket.onmessage = function(event) {
            let cpow = parseCPOW(event.data);

            self.setState({
                cpow: cpow
            });

            let service_output = cpow.header.additionalText;
            document.getElementById('service_output').innerHTML += service_output + "<br/>";
        };
    }

    openChat(event) {
        //let targetName = event.target.parentNode.classList[1];
        let targetName = event.target.name;
        console.log('Open chat target: ' + targetName);

        // Get messages
        let messages = document.getElementsByClassName('messages');
        messages.innerHTML = 'Your last dummy messages from John Doe!'
    };

    sendMessage(event) {

    }

    render() {
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
            padding: '1% 0'
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
                                    Hi {this.state.cpow.user.name}!
                                </NavItem>
                            </NavGroup>
                            <NavGroup align='center'>
                                <NavItem>
                                    Chatty!
                                </NavItem>
                            </NavGroup>
                            <NavToggle/>
                            <NavGroup align='right' isMenu>
                                <NavItem>
                                    <Input type='search'/>
                                    <Button>Logout</Button>
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
                                    <CardHeaderTitle>Miles Doe</CardHeaderTitle>
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
            cpow: '',
            serviceOutput: props.serviceOutput
        };
        this.onChange = this.onChange.bind(this);
        this.login = this.login.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ socket: nextProps.socket });
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
            let cpow = parseCPOW(event.data);

            self.setState({
                cpow: cpow
            });

            let service_output = cpow.header.additionalText;
            self.setState({
                serviceOutput: service_output
            });

            if (self.state.cpow.responseType === "SUCCESS" && self.state.cpow.actionType === "USER_LOGIN_ACCOUNT") {
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
                    <Chat socket={self.state.socket} cpow={self.state.cpow} />,
                    document.getElementById('app')
                )
            }
        };

        return (
            <div>
                <Container>
                    <Title size="is4">Login</Title>
                    <form onSubmit={this.login}>
                        <p className="control-box">
                            <Label>Username:</Label>
                            <Input className="username" onChange={this.onChange}/>
                            <Label>Password:</Label><p/>
                            <Input className="password" onChange={this.onChange} type="password"/>
                            <Button color="isPrimary" type="submit">Login</Button>
                        </p>
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
            inputname: '',
            inputusername: '',
            cpow: null,
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
            let cpow = parseCPOW(event.data);

            self.setState({
                cpow: cpow
            });

            let service_output = cpow.header.additionalText;
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

        if (length >= this.state.cpow.user.minimumLength) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #4caf50; font-weight: bold;">' +
                '<br>Great name! ' + event.target.value + '</br></span>';

            if(this.state.password.length === this.state.cpow.password.minimumLength) {
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
        let minimum = this.state.cpow.password.minimumLength;
        let usermin = this.state.cpow.user.minimumLength;

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
                               onChange={this.validatePasswordOnChange}
                               type="password">{this.state.password}</Input>
                        <span id="validate"/>
                        <Button color="isPrimary"
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
            socket: new ReconnectingWebSocket(props.address),
            serviceOutput: ''
        };
    }

    shouldComponentUpdate() {
        return true;
    }

    componentWillMount() {
        // Actual this to access this.setState({})
        let self = this;

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
        }

        this.state.socket.onclose = function () {
            self.setState({
                serviceOutput: "[chatty-client]: Connection is closed by service."
            });
        };

        this.state.socket.onmessage = function(event) {
            let cpow = parseCPOW(event.data);

            self.setState({
                cpow: cpow
            });

            let service_output = cpow.header.additionalText;
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
                <Box>
                    <Content>{this.state.serviceOutput}</Content>
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
            }
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
        let _socket = new WebSocket(this.state.servicePath);
        this.setState({
            socket:  _socket
        });

        let self = this;
        _socket.onopen = function () {
            self.setState({
                buttonEnter: 'isActive',
                socket: _socket
            })
        };

        _socket.onerror = function () {
            self.setState({
                buttonEnter: 'isDisabled'
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
                <Section style={this.state.serviceInputStyle}>
                    <Title>Service</Title>
                    <FormHorizontal>
                        <ControlLabel>Address</ControlLabel>
                        <Group>
                            <Input onChange={this.addInternally}/>
                            <Button color='isPrimary' state={this.state.buttonTest} onClick={this.testConnection}>Test connection!</Button>
                            <Button color='isPrimary' state={this.state.buttonEnter}
                                    onClick={this.addServiceAddress}>Enter</Button>
                        </Group>
                    </FormHorizontal>
                </Section>
            </div>
        );
    }
}

ReactDOM.render(
    <InitApp/>,
    document.getElementById('app')
);
