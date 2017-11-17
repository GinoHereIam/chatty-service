
import {Button, Dialog, DialogTitle, Input, ListItemText, List, ListItem, ListItemAvatar, Avatar} from "material-ui";
import PersonIcon  from 'material-ui-icons/Person'
import Slide from "material-ui/transitions/Slide"

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    searchInput: theme.mixins.gutters({
        padding: 16,
        textAlign: 'center'
    }),

});

function Usersearch(props) {
    const classes = props.classes;

    return (
        <Dialog
            open={props.showUserSearch}
            onRequestClose={props.onRequestClose}
            transition={Slide}>
            <DialogTitle>User search</DialogTitle>
            <div>
                <Input placeholder={'Search for your friend!'} onChange={props.userLookup} className={classes.searchInput}/>
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
            </div>
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