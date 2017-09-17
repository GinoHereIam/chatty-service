import React from 'react';
import PropTypes from 'prop-types';
// Import Icons
import Style from 'material-ui-icons/Style';
import Contacts from 'material-ui-icons/Contacts'
import StarBorder from 'material-ui-icons/StarBorder'
import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'
// Transitions
import Collapse from 'material-ui/transitions/Collapse';
import {
    withStyles, AppBar, Toolbar,
    Typography, List, ListItemText, ListItemIcon, ListItem, Drawer, Switch,
    Divider, ListItemSecondaryAction
} from "material-ui";

const drawerWidth = 240;
const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        marginTop: 0,
        zIndex: 1,
        overflow: 'hidden',
    },
    appFrame: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    appBar: {
        position: 'absolute',
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        order: 1,
    },
    drawerPaper: {
        position: 'relative',
        height: 'auto',
        width: drawerWidth,
    },
    nested: {
        paddingLeft: theme.spacing.unit * 4,
    },
    //drawerHeader: theme.mixins.toolbar,
});

function ChattyAppBar(props) {
    const { classes } = props;
    return (
        <div className={classes.root}>
            <div className={classes.appFrame}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Typography type="title" color="inherit" noWrap>
                            Chatty Webclient
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer type="permanent"
                        classes={{
                            paper: classes.drawerPaper,
                        }}>
                    <div className={classes.drawerHeader} />
                    <List>
                        <ListItem button>
                            <ListItemText primary="Settings"/>
                        </ListItem>
                        <ListItem button onClick={props.openSubContacts}>
                            <ListItemIcon>
                                <Contacts />
                            </ListItemIcon>
                            <ListItemText inset primary="Contacts" />
                            {props.isContactsOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={ props.isContactsOpen } transitionDuration="auto" unmountOnExit>
                            <ListItem button className={classes.nested}>
                                <ListItemIcon>
                                    <StarBorder />
                                </ListItemIcon>
                                <ListItemText inset primary="Starred" />
                            </ListItem>
                        </Collapse>
                    </List>
                        <Divider/>
                        <ListItem>
                            <ListItemIcon>
                                <Style />
                            </ListItemIcon>
                            <ListItemText primary="Style" />
                            <ListItemSecondaryAction>
                                <Switch
                                    onChange={props.switchStyleOnClick}
                                    checked={props.switchStyleChecked}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem button onClick={props.logout}>
                            <Typography>Logout</Typography>
                        </ListItem>
                        <ListItem button onClick={props.showAbout}>
                            <Typography>About Chatty</Typography>
                        </ListItem>
                </Drawer>
            </div>
        </div>
    );
}

ChattyAppBar.propTypes = {
    classes: PropTypes.object.isRequired,
    // Logout function
    logout: PropTypes.func.isRequired,
    // Show contacts sublist
    openSubContacts: PropTypes.func.isRequired,
    isContactsOpen: PropTypes.bool.isRequired,
    // Show About
    showAbout: PropTypes.bool.isRequired,
    // Drawer properties
    //drawerHandleOpen: PropTypes.func.isRequired,
    //drawerOnRequestClose: PropTypes.func.isRequired,
    //drawerOpen: PropTypes.bool.isRequired,

    // Switch theme properties
    switchStyleOnClick: PropTypes.func.isRequired,
    switchStyleChecked: PropTypes.bool.isRequired,
};

export default withStyles(styles)(ChattyAppBar);