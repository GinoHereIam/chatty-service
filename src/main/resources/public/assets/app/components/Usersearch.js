
import {
    Button, Dialog, DialogTitle, Input, ListItemText, List, ListItem, ListItemAvatar, Avatar,
    DialogContent, DialogContentText, TextField, DialogActions
} from "@material-ui/core";
import PersonIcon  from '@material-ui/icons/Person'
import Slide from "@material-ui/core"
import { teal, blueGrey, red, blue } from '@material-ui/core'

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
    dialog: {
        borderRadius: '5%',
        innerHeight: '30%'
    },
    searchInput: {
        textAlign: 'center',
    },

});

function Usersearch(props) {
    const classes = props.classes;

    return (
        <Dialog
            className={classes.dialog}
            open={props.showUserSearch}
            onClose={props.onRequestClose}
            TransitionComponent={Slide}>
            <DialogTitle id="form-dialog-title">User search</DialogTitle>
            <DialogContent>
                <DialogContentText>
                You can search for friends here!
                </DialogContentText>
                <Input placeholder={'Your friends id ...'} onChange={props.userLookup} className={classes.searchInput}/>
                <DialogContentText>
                    <List component="nav">
                        {
                            props.foundUser.map(name =>(
                                <ListItem component="div" button onClick={() => props.submitUser(name)} key={name}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon/>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={name}/>
                                </ListItem>
                            ))
                        }
                    </List>
                </DialogContentText>
                <DialogActions>
                    <Button onClick={props.onRequestClose} color={'primary'} variant="contained" size="medium">Close</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}

Usersearch.propTypes = {
    classes: PropTypes.object.isRequired,
    showUserSearch: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    userLookup: PropTypes.func.isRequired,
    submitUser: PropTypes.func.isRequired,
    foundUser: PropTypes.array.isRequired
};

export default withStyles(styles)(Usersearch);