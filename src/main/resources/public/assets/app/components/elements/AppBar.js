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
import Send from 'material-ui-icons/Send';

import Collapse from 'material-ui/transitions/Collapse';
import {
    AppBar, Toolbar,
    Typography, List, ListItemText, ListItemIcon, ListItem, Drawer, Switch,
    Divider, ListItemSecondaryAction, ListItemAvatar, Avatar, Paper, Input, TextField, Button
} from "material-ui";

import { withStyles } from "material-ui/styles";

const styles = theme => ({
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
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
    header: {
        padding: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2
    },
    content: {
        position: 'absolute',
        width: '30%',
        maxHeight: '60%',
        padding: theme.spacing.unit * 5,
        marginLeft: '20%',
        marginTop: 56,
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100% - 64px)',
            marginTop: 64,
        }
    },
    messages: {
        height: '100%',
        padding: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 3
    },
    textFieldRoot: {
        background: theme.palette.background.paper,
        marginBottom: theme.spacing.unit * 3,
        bottom: 0,
        padding: 0,
        'label + &': {
            marginTop: theme.spacing.unit * 3,
        },
    },
    textFieldInput: {
        borderRadius: 4,
        border: '1px solid #ced4da',
        padding: '10px 12px',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:focus': {
            boxShadow: '0 0 0 0.2rem ' + theme.palette.primary[500]
        },
    },
    textFieldFormLabel: {
        fontSize: 18,
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
                                props.contacts.map(username => (
                                    <ListItem button onClick={props.openChat(username)}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <PersonIcon/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={username}/>
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
                                {props.isConnected ? <ChatBubble color="green"/>  : <Warning color="red"/> }
                            </ListItemIcon>
                            <ListItemText primary={props.isConnected ? 'Chatty available'  : 'You are offline!'}/>
                        </ListItem>
                    </List>
                </Drawer>
                {props.clickedChat ? <main className={classes.content}>
                    {
                        props.context.map(context => (
                            <Paper elevation={4} square={false} className={classes.header}>
                                <Typography type={'title'}>Chat with {context.participant}</Typography>
                            </Paper>
                        ))
                    }
                    <Paper elevation={4} square={false} className={classes.messages}>
                        <Typography type={'subheading'}>[This is a message container]</Typography>
                    </Paper>
                    <TextField
                        multiline={true} fullWidth={true} rows={3}
                        InputProps={{
                            disableUnderline: true,
                            classes: {
                                root: classes.textFieldRoot,
                                input: classes.textFieldInput,
                            },
                        }}
                        InputLabelProps={{
                            //shrink: true,
                            className: classes.textFieldFormLabel,
                        }}
                    />
                    <Button raised color={'primary'}>
                        Send
                        <Send className={classes.rightIcon}/>
                    </Button>
                </main> : <main/>}
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
    // Open chat
    openChat: PropTypes.func.isRequired,
    clickedChat: PropTypes.bool.isRequired,
    // Chat context
    context: PropTypes.array.isRequired,
    // Open user search dialog
    openUserSearch: PropTypes.func.isRequired,
    // Switch theme properties
    switchStyleOnClick: PropTypes.func.isRequired,
    switchStyleChecked: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    contacts: PropTypes.array.isRequired
};

export default withStyles(styles)(ChattyAppBar);