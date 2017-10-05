
import {Button, Paper, TextField} from "material-ui";
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

function Service(props) {
    const classes = props.classes;
    let elementStyle = {
        marginRight: '2%'
    };
    return (
        <Paper className={classes.root} elevation={4}>
                <span style={elementStyle}>
                    <TextField onChange={props.addInternally}
                               label='Service address'
                               placeholder='ws://localhost:8080/chatty'/>
                </span>
                <span style={elementStyle}>
                    <Button disabled={props.buttonTestDisabled}
                            onClick={props.testConnection}>
                        Verify
                    </Button>
                </span>
                <span style={elementStyle}>
                    <Button color='primary' disabled={props.buttonEnterDisabled}
                            onClick={props.addServiceAddress}>
                        Enter
                    </Button>
                </span>
        </Paper>
    )
}

Service.propTypes = {
    classes: PropTypes.object.isRequired,
    testConnection: PropTypes.func.isRequired,
    buttonTestDisabled: PropTypes.bool.isRequired,
    addServiceAddress: PropTypes.func.isRequired,
    buttonEnterDisabled: PropTypes.bool.isRequired,
};

export default withStyles(styles)(Service);