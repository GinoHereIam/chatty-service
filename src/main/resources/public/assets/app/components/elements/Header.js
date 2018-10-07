
import { Paper, Typography} from "@material-ui/core";
import { withStyles } from "@material-ui/core"
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
    header: {
        fontSize: '2.2em',
        color: theme.palette.secondary[100]
    },
    subheader: {
        fontSize: '1.3em',
        color: theme.palette.secondary[100]
    }
});

function Header(props) {
    const classes = props.classes;
    return(
        <Paper className={classes.root} elevation={2} square={true}>
            <Typography type='display1' className={classes.header}>Chatty</Typography>
            <Typography type='subheading'
                        className={classes.subheader}
                        component='p'>Your own communication channel! Your own cloud chat service!</Typography>
        </Paper>
    )
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);