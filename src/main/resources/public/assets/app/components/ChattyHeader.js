
import {Paper, Typography} from "material-ui";
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    root: theme.mixins.gutters({
        paddingTop: theme.spacing.unit * 3,
        paddingBottom: theme.spacing.unit * 3,
        marginBottom: '5%',
        textAlign: 'center'
    }),
});

function ChattyHeader(props) {
    const classes = props.classes;
    return(
        <Paper className={classes.root} elevation={4} square={true}>
            <Typography type='display1'>Chatty</Typography>
            <Typography type='subheading' component='p'>Your own communication channel! Your own cloud chat service!</Typography>
        </Paper>
    )
}

ChattyHeader.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChattyHeader)