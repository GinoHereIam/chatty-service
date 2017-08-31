import * as React from "react";
import * as ReactDOM from "react-dom";

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
            cpow: props.cpow
        }
    }

    render() {
        return(
            <div>
                Hello {this.state.cpow.user.username} to your chat!
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
            cpow: ''
        };
        this.onChange = this.onChange.bind(this);
        this.login = this.login.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ socket: nextProps.socket });
    }

    onChange(event) {
        this.setState({
            [event.target.name]: event.target.value
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
            document.getElementById('service_output').innerHTML += service_output + "<br/>";

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
            <div className="container" id="login">
                <h1 className="title">Login</h1>
                <form onSubmit={this.login}>
                    <p className="control-box">
                        <label className="label">Username:</label>
                        <input className="input" name="username" onChange={this.onChange} value={this.state.username}/>
                        <label className="label">Password:</label>
                        <input className="input" name="password" onChange={this.onChange}
                               value={this.state.password} type="password"/><p/>
                        <br/>
                        <input className="button is-primary" type="submit" value="Submit" />
                    </p>
                </form>
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
            cpow: null
        };

        this.validatePasswordOnChange = this.validatePasswordOnChange.bind(this);
        this.validateUsernameOnChange = this.validateUsernameOnChange.bind(this);
        this.register = this.register.bind(this);
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

    validateUsernameOnChange(event) {
        let btn = document.getElementById('submitBtn');
        let length = event.target.value.length;

        let validate_field = document.getElementById('validate');

        this.setState({
            [event.target.name]: event.target.value
        });

        if (length >= this.state.cpow.user.minimumLength) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #4caf50; font-weight: bold;">' +
                '<br>Great name! ' + event.target.value + '</br></span>';
            btn.disabled = false;

        } else {

            // Validation output
            validate_field.innerHTML = '<span style="color: #f44336; font-weight: bold;">' +
                '<br>Too short :( ' + event.target.value + '</br></span>';
            btn.disabled = true;
        }
    }

    validatePasswordOnChange(event) {
        let value = event.target.value;
        let length = value.length;

        this.setState({
            [event.target.name]: value
        });

        let validate_field = document.getElementById('validate');

        let good = 12;
        let minimum = this.state.cpow.password.minimumLength;

        let btn = document.getElementById('submitBtn');
        if (length >= minimum && length < good) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #4caf50; font-weight: bold;">' +
                '<br>Good password! ' + String(good - length) + ' chars left for perfect one!</br></span>';

            if(this.state.username.length !== 0 || this.state.name.length !== 0) {
                btn.disabled = false;
            }

        } else if (length >= good) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #4caf50; font-weight: bold;"><br>Perfect one!</br></span>';

        } else {

            // Validation output
            validate_field.innerHTML = '<span style="color: #f44336; font-weight: bold;">' +
                '<br>Too weak :( ' + String(minimum - length) + ' left!</br></span>';
            btn.disabled = true;
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
            <div className="container" id="register">
                <h1 className="title">Register</h1>
                <form onSubmit={this.register}>
                    <p className="control-box">
                        <label className="label">Username:</label>
                        <input className="input" name="username" onChange={this.validateUsernameOnChange} value={this.state.username}/>
                        <label className="label">Display name:</label>
                        <input className="input" name="name" onChange={this.validateUsernameOnChange} value={this.state.name}/>
                        <label className="label">Password:</label><p/>
                        <input className="input" name="password" onChange={this.validatePasswordOnChange} value={this.state.password} type="password"/>
                        <br/>
                        <span id="validate"/>
                        <br/>
                        <input className="button is-primary" type="submit" value="Submit" id="submitBtn" disabled="true"/>
                    </p>
                </form>
            </div>
        )
    }
}

export class Auth extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: new ReconnectingWebSocket(props.address)

        };

        //this.handleChange = this.handleChange.bind(this);
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
            // console.log('open:', event);
            self.state.socket.send(message)
        };

        this.state.socket.onclose = function () {
            document.getElementById('service_output').innerHTML += "[chatty-client]: Connection is closed by service." + "<br/>";
        };

        this.state.socket.onmessage = function(event) {
            let cpow = parseCPOW(event.data);

            self.setState({
                cpow: cpow
            });

            let service_output = cpow.header.additionalText;
            document.getElementById('service_output').innerHTML += service_output + "<br/>";
        };
    }

    /*
    handleChange = function(event) {
        event.preventDefault();

        let address = document.getElementById('ws').value;
        document.getElementById('service_output').innerHTML += "[chatty-client]: Create new service connection." + "<br/>";

        this.state.socket.close();
        document.getElementById('service_output').innerHTML += "[chatty-client]: Closed default connection" + "<br/>";

        let socket = ReconnectingWebSocket(address);
        this.setState({
            socket: socket
        })
    };
    */

    render() {
        return (
            <span>
                <div className="box">
                    <Login socket={this.state.socket} />
                </div>
                <div className="box">
                    <Register socket={this.state.socket} />
                </div>
            </span>
        );
    }
}

let _socket;
window.onAddWS = function () {
    // Get service first
    let address = document.getElementById('ws_input');
    document.getElementById('service_output_box').style.display = "block";


    let service = document.getElementById('ws');
    if(_socket !== undefined) _socket.close();
    setTimeout(service.style.display = 'none', 3000);

    ReactDOM.render(
        <Auth address={address.value}/>,
        document.getElementById('app')
    );
};

window.checkInput = function () {
    let _socket;
    let btn = document.getElementById('addServiceBtn');

    // Get service first
    let address = document.getElementById('ws_input').value;
    // Check for valid websocket connection
    // if the connection opens, it must work!
    _socket = new WebSocket(address);
    _socket.onopen = function () {
        btn.disabled = false;
    };

    _socket.onerror = function () {
        btn.disabled = true;
    };
};