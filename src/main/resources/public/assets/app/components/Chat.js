
import {Divider, List, Paper, ListItem, ListItemText} from "@material-ui/core";
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import ChattyAppBar from './elements/AppBar'

export function Chat(props) {
    const classes = props.classes;
    return(
        <span className={classes.root}>

        </span>
    )
}

Chat.propTypes = {
    classes: PropTypes.object.isRequired,
    // Settings list properties
};

//export default withStyles(styles)(Chat);