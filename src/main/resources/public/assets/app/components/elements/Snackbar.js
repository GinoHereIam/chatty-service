import Snackbar from '@material-ui/core/Snackbar';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import PropTypes from 'prop-types';


const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit * 3,
    },
    snackbar: {
        margin: theme.spacing.unit,
    },
});

function ChattySnackbar(props){
    const classes = props.classes;

    return(
        <Snackbar
            className={classes.root}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={props.open}
            onClose={props.onRequestClose}
            TransitionComponent={Fade}
            ContentProps={{
                'aria-describedby': 'service-message',
            }}
            // autoHideDuration={3000}
            message={<span id='service-message'>{props.message}</span>}
        />
    )
}

ChattySnackbar.propTyes = {
    classes: PropTypes.object.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired
};

export default withStyles(styles)(ChattySnackbar);