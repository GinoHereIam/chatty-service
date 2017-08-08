// Chatty-client components
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: props.socket,
            token: props.token,
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
            console.log('client send: login()');

            let json = JSON.stringify({
                "actionType": "USER_LOGIN_ACCOUNT",
                "username": this.state.username,
                "password": this.state.password,
                "content": "",
                // Need a user token
                "token": this.state.token
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
                    <label>Username</label><br/>
                    <input name="username" onChange={this.onChange} value={this.state.username}/><p/>
                    <label>Password</label><br/>
                    <input name="password" onChange={this.onChange} value={this.state.password} type="password"/><p/>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

function ValidateInput(props) {
    let minimum = 8;
    let good = 14;

    if(props.password.length >= minimum && props.password.length < good) {
        return <span style={{color: "#009688"}}>
            Great!<br/>
            <span style={{color: "#f44336"}}>{good - props.password.length}</span> chars left for a good one!<br/>
        </span>
    }else if(props.password.length >= good){
        return <span style={{color: "#009688"}}>Perfect!<br/></span>
    } else{
        return <span style={{color: "#f44336"}}>
            {minimum - props.password.length} chars left for minimum!<br/>
        </span>
    }
}

function cpowToJS(event) {
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
        token: cpow[5].user[3].token
    };

    // CPOW[6] doesn't matter for now

    const chats = {
        chatIDs: cpow[7].chats[0].chatIDs
    };

    let CPOW = {
        version: version,
        actionType: actionType,
        message: message,
        header: header,
        responseType: responseType,
        user: user,
        chats: chats
    };

    return CPOW

}

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: props.socket,
            output: '',
            username: '',
            name: '',
            password: ''
        };

        this.onChange = this.onChange.bind(this);
        this.register = this.register.bind(this);
    }

    onChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        })

    }

    register (event) {
        event.preventDefault();
        if( this.state.username !== "" || this.state.name !== "" || this.state.password !== "") {
            console.log('client send: register()');
            this.state.socket.send(JSON.stringify({
                "actionType": "USER_REGISTER_ACCOUNT",
                "name": this.state.name,
                "username": this.state.username,
                "password": this.state.password,
                "content": "",
                "token": ""
            }));
        }

    };

    render() {
        return (
            <div>
                <h1>Register</h1>
                <form onSubmit={this.register}>
                    <label>Username</label><br/>
                    <input name="username" onChange={this.onChange} value={this.state.username}/><p/>
                    <label>Display name</label><br/>
                    <input name="name" onChange={this.onChange} value={this.state.name}/><p/>
                    <label>Password</label><br/>
                    <input name="password" onChange={this.onChange} value={this.state.password} type="password"/><p/>
                    <ValidateInput password={this.state.password}/><p/>
                    <input type="submit" value="Submit" />
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
            let socket = new WebSocket("ws://localhost:8080/ws/chatty");
            let token = "";

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
                console.log('close:', event)
            };

            socket.onerror = function (event) {
                console.log('error:', event)
            };
            socket.onmessage = function (event) {
                // TODO parse this JSON structure and set states
                console.log('server said:', event.data);
                let data = cpowToJS(event.data);

                token = data.user.token;
                let additionalText = data.header.additionalText;

                if(additionalText !== undefined) {
                    document.getElementById('service_output').innerHTML += additionalText + "<br/>";
                }
            };

        return (
            <div>
                <Login socket={socket} token={token}/>
                <Register socket={socket}/>
            </div>
        );
    }
}

ReactDOM.render(
    <Authentication/>,
    document.getElementById('app')
);