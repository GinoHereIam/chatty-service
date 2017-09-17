
import {Button, Paper, TextField, FormControlLabel, FormLabel} from "material-ui";
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

});

// Register
function RegisterElements(props) {
    const classes = props.classes;
    return (
        <Paper className={classes.root}>
            <FormLabel component='legend'>Register</FormLabel>
            <form onSubmit={props.registerSubmit}>
                <FormControlLabel control={
                    <TextField className="username"
                               onChange={props.validateUsernameOnChange('username')}
                               label="Username"/>
                }/>
                <FormControlLabel control={
                    <TextField className="name"
                               onChange={props.validateUsernameOnChange('name')}
                               label='Display name'/>
                }/>
                <FormControlLabel control={
                    <TextField className="password"
                               onChange={props.validatePasswordOnChange('password')}
                               type="password"
                               label='Password'>{props.passwordInputValue}</TextField>
                }/>
                <Button color="primary"
                        disabled={props.buttonRegisterDisabled}
                        type="submit"
                        className="submitBtn">Register
                </Button>
            </form>
        </Paper>
    )
}

RegisterElements.propTypes = {
    classes: PropTypes.object.isRequired,
    registerSubmit: PropTypes.func.isRequired,
    validatePasswordOnChange: PropTypes.func.isRequired,
    validateUsernameOnChange: PropTypes.func.isRequired,
    passwordInputValue: PropTypes.string.isRequired,
    buttonRegisterDisabled: PropTypes.bool.isRequired
};

export default withStyles(styles)(RegisterElements);