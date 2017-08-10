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

    let CPOW = {
        version: version,
        actionType: actionType,
        message: message,
        header: header,
        responseType: responseType,
        user: user,
        chats: chats,
        password: password
    };

    return CPOW
}

// Chatty-client components
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: props.socket,
            username: '',
            password: ''
        };
        this.onChange = this.onChange.bind(this);
        this.login = this.login.bind(this)
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

            console.log(json);
            this.state.socket.send(json)
        }
    };

    render() {
        return (
            <div>
                <h1>Login</h1>
                <form onSubmit={this.login}>
                    <label>Username:</label><br/>
                    <input name="username" onChange={this.onChange} value={this.state.username}/><p/>
                    <label>Password:</label><br/>
                    <input name="password" onChange={this.onChange} value={this.state.password} type="password"/><p/>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
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
        this.setState({
            [event.target.name]: event.target.value
        });

        let btn = document.getElementById('submitBtn');
        let length = event.target.value.length;

        let validate_field = document.getElementById('validate');

        if (length >= this.state.cpow.user.minimumLength) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #26a69a; font-weight: bold;">' +
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
            [event.target.name]: event.target.value
        });

        let validate_field = document.getElementById('validate');

        let good = 14;
        let minimum = this.state.cpow.password.minimumLength;


        let btn = document.getElementById('submitBtn');
        if (length >= minimum && length < good) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #26a69a; font-weight: bold;">' +
                '<br>Good password! ' + String(good - length) + ' chars left for perfect one!</br></span>';

            validate_field.innerHTML = <span style="{'color': '#26a69a', 'font-weight: bold'}">Good password! {good - length} chars left for perfect one!</span>;

            if(this.state.username.length !== 0 || this.state.name.length !== 0) {
                btn.disabled = false;
            }

        } else if (length >= good) {

            // Validation output
            validate_field.innerHTML = '<span style="color: #26a69a; font-weight: bold;"><br>Perfect one!</br></span>';

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
            <div>
                <h1>Register</h1>
                <form onSubmit={this.register}>
                    <label>Username:</label><br/>
                    <input name="username" onChange={this.validateUsernameOnChange} value={this.state.username}/><p/>
                    <label>Display name:</label><br/>
                    <input name="name" onChange={this.validateUsernameOnChange} value={this.state.name}/><p/>
                    <label>Password:</label><br/>
                    <input name="password" onChange={this.validatePasswordOnChange} value={this.state.password} type="password"/><p/>
                    <span id="validate"/><br/>
                    <input type="submit" value="Submit" id="submitBtn" disabled="true"/>
                </form>
            </div>
        )
    }
}

class Authentication extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        let socket = new ReconnectingWebSocket("ws://localhost:8080/ws/chatty");

        socket.onopen = function (event) {
            let message = JSON.stringify({
                "actionType": "USER_CONNECT",
                "username": "",
                "name": "",
                "password": "",
                "content": "",
                "token": ""
            });
            console.log('open:', event);
            socket.send(message)
        };

        socket.onclose = function (event) {
            console.log('close:', event);
            document.getElementById('service_output').innerHTML += "[chatty-client]: Connection is closed by service." + "<br/>";
        };

        socket.onerror = function (event) {
            console.log('error:', event)
        };

        return (
            <div>
                <Login socket={socket}/>
                <Register socket={socket}/>
            </div>
        );
    }
}

ReactDOM.render(
    <Authentication/>,
    document.getElementById('app')
);
