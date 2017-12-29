
import {
    Button, Dialog, DialogTitle, Input, ListItemText, List, ListItem, ListItemAvatar, Avatar,
    DialogContent, DialogContentText, TextField
} from "material-ui";
import PersonIcon  from 'material-ui-icons/Person'
import Slide from "material-ui/transitions/Slide"
import { teal, blueGrey, red, blue } from 'material-ui/colors'

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    dialog: {
        borderRadius: '5%'
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
            onRequestClose={props.onRequestClose}
            transition={Slide}>
            <DialogTitle>User search</DialogTitle>
            <DialogContent>
                <Input placeholder={'Search for your friend!'} onChange={props.userLookup} className={classes.searchInput}/>
                <DialogContentText>
                    <List>
                        {
                            props.foundUser.map(name =>(
                                <ListItem button onClick={props.submitUser(name)} key={name}>
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