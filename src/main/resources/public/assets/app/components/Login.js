// Login
import {Paper, FormControlLabel, TextField, Button, FormLabel} from "material-ui";
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    root: theme.mixins.gutters({
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 3,
        textAlign: 'center'
    }),
    legend: {
        fontSize: '1.3em',
        margin: 0,
        paddingBottom: 16
    }
});

export function LoginElements(props) {
    const classes = props.classes;
    return(
        <Paper className={classes.root}>
            <FormLabel component='legend' className={classes.legend}>Login</FormLabel>
            <form onSubmit={props.loginSubmit}>
                <FormControlLabel control={
                    <TextField className="username"
                               onChange={props.onChangeUsername('username')} label='Username'/>
                } required/>
                <FormControlLabel control={
                    <TextField className="password"
                               onChange={props.onChangePassword('password')} label='Password' type="password"/>
                } required/>
                <Button color='primary' type='submit' raised>Login</Button>
            </form>
        </Paper>
    )
}

LoginElements.propTypes = {
    classes: PropTypes.object.isRequired,
    loginSubmit: PropTypes.func.isRequired,
    onChangeUsername: PropTypes.func.isRequired,
    onChangePassword: PropTypes.func.isRequired
};

export default withStyles(styles)(LoginElements);