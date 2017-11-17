import React from 'react';
import PropTypes from 'prop-types';
// Import Icons
import Style from 'material-ui-icons/Style';
import Contacts from 'material-ui-icons/Contacts'
import PersonIcon  from 'material-ui-icons/Person'
import StarBorder from 'material-ui-icons/StarBorder'
import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'
// Transitions
import Collapse from 'material-ui/transitions/Collapse';
import {
    AppBar, Toolbar,
    Typography, List, ListItemText, ListItemIcon, ListItem, Drawer, Switch,
    Divider, ListItemSecondaryAction, ToolBarGroup, ListItemAvatar, Avatar
} from "material-ui";

import { withStyles } from "material-ui/styles";

let drawerWidth = 'auto';

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
    // props.contacts -> ["username", ...]
    return (
        <div className={classes.root}>
            <div className={classes.appFrame}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Typography type={'title'} align={'center'} color={'inherit'}>
                            Chatty Webclient
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer type="permanent"
                        classes={{
                            paper: classes.drawerPaper,
                        }}>
                    <List>
                        <ListItem>
                            <Typography type={'title'} noWrap>Hi {props.username}!</Typography>
                        </ListItem>
                        <ListItem button onClick={props.openUserSearch}>
                            <ListItemText inset primary={'Search friends'}/>
                        </ListItem>
                        <ListItem button>
                            <ListItemText inset primary="Settings"/>
                        </ListItem>
                        <ListItem button onClick={props.openSubContacts}>
                            <ListItemIcon>
                                <Contacts />
                            </ListItemIcon>
                            <ListItemText inset primary="Contacts" />
                            {props.isContactsOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={ props.isContactsOpen } transitionDuration="auto" unmountOnExit>
                            {
                                props.contacts.map(name =>(
                                    <ListItem button key={name}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <PersonIcon/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={name}/>
                                    </ListItem>
                                ))
                            }
                        </Collapse>
                    </List>
                        <Divider/>
                        <ListItem>
                            <ListItemIcon>
                                <Style />
                            </ListItemIcon>
                            <ListItemText inset primary="Style" />
                            <ListItemSecondaryAction>
                                <Switch
                                    onChange={props.switchStyleOnClick}
                                    checked={props.switchStyleChecked}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem button onClick={props.logout}>
                            <ListItemText inset primary={'Logout'}/>
                        </ListItem>
                        <ListItem button onClick={props.showAbout}>
                            <ListItemText inset primary={'About Chatty'}/>
                        </ListItem>
                </Drawer>
            </div>
        </div>
    );
}

ChattyAppBar.propTypes = {
    classes: PropTypes.object.isRequired,
    // Find a friend
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
    // Open user search dialog
    openUserSearch: PropTypes.func.isRequired,
    // Switch theme properties
    switchStyleOnClick: PropTypes.func.isRequired,
    switchStyleChecked: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    contacts: PropTypes.array.isRequired
};

export default withStyles(styles)(ChattyAppBar);