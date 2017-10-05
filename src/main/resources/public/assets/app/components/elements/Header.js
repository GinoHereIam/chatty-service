
import { Paper, Typography} from "material-ui";
import { withStyles } from "material-ui/styles"
import React from 'react';
import PropTypes from 'prop-types';

const styles = theme => ({
    root: theme.mixins.gutters({
        paddingTop: theme.spacing.unit * 3,
        paddingBottom: theme.spacing.unit * 3,
        marginBottom: '5%',
        textAlign: 'center',
        background: theme.palette.primary[500],
    }),
    text: {
        color: theme.palette.secondary[100]
    }
});

function Header(props) {
    const classes = props.classes;
    return(
        <Paper className={classes.root} elevation={4} square={true}>
            <Typography type='display1' className={classes.text}>Chatty</Typography>
            <Typography type='subheading'
                        className={classes.text}
                        component='p'>Your own communication channel! Your own cloud chat service!</Typography>
        </Paper>
    )
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);