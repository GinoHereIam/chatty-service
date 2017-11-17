import Snackbar from 'material-ui/Snackbar';
import * as React from 'react';
import { render } from 'react-dom';
import { withStyles } from 'material-ui/styles';
import Fade from 'material-ui/transitions/Fade';
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

    return(
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={props.open}
            onRequestClose={props.onRequestClose}
            transition={Fade}
            SnackbarContentProps={{
                'aria-describedby': 'service-message',
            }}
            autoHideDuration={3000}
            message={<span id='service-message'>{props.message}</span>}
        />
    )
}

ChattySnackbar.propTyes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChattySnackbar);