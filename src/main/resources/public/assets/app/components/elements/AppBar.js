import React from 'react';
import PropTypes from 'prop-types';
// Import Icons
import Style from 'material-ui-icons/Style';
import Contacts from 'material-ui-icons/Contacts'
import PersonIcon  from 'material-ui-icons/Person'
import StarBorder from 'material-ui-icons/StarBorder'
import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'
import ChatBubble from 'material-ui-icons/ChatBubble'
import Settings from 'material-ui-icons/Settings'
import Search from 'material-ui-icons/Search'
import ExitToApp from 'material-ui-icons/ExitToApp'
import Info from 'material-ui-icons/Info'
import Warning from 'material-ui-icons/Warning'
import green from 'material-ui/colors/green';
// Transitions
import Collapse from 'material-ui/transitions/Collapse';
import {
    AppBar, Toolbar,
    Typography, List, ListItemText, ListItemIcon, ListItem, Drawer, Switch,
    Divider, ListItemSecondaryAction, ToolBarGroup, ListItemAvatar, Avatar
} from "material-ui";

import { withStyles } from "material-ui/styles";

const styles = theme => ({
    list: {
        width: '250',
    },
    listFull: {
        width: 'auto',
    },
    appBar: {
        position: 'absolute',
        paddingLeft: '12%'
    },
});

function ChattyAppBar(props) {
    const { classes } = props;
    // props.contacts -> ["username", ...]
    return (
        <div className={classes.root}>
            <div className={classes.appFrame}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Typography type={'display1'} color={'inherit'}>
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
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText inset primary={props.username}/>
                        </ListItem>
                        <Divider/>
                        <ListItem button onClick={props.openUserSearch}>
                            <ListItemIcon>
                                <Search/>
                            </ListItemIcon>
                            <ListItemText inset primary={'Search friends'}/>
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <Settings/>
                            </ListItemIcon>
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
                            <ListItemIcon>
                                <ExitToApp/>
                            </ListItemIcon>
                            <ListItemText inset primary={'Logout'}/>
                        </ListItem>
                        <ListItem button onClick={props.showAbout}>
                            <ListItemIcon>
                                <Info/>
                            </ListItemIcon>
                            <ListItemText inset primary={'About Chatty'}/>
                        </ListItem>
                        <Divider/>
                        <ListItem>
                            <ListItemIcon>
                                {props.isConnected ? <ChatBubble color="accent"/>  : <Warning color="accent"/> }
                            </ListItemIcon>
                            <ListItemText primary={props.isConnected ? 'Chatty available'  : 'You are offline!'}/>
                        </ListItem>
                    </List>
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
    isConnected: PropTypes.bool.isRequired,
    // Show contacts sublist
    openSubContacts: PropTypes.func.isRequired,
    isContactsOpen: PropTypes.bool.isRequired,
    // Show About
    showAbout: PropTypes.func.isRequired,
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