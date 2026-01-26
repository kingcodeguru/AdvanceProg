// This file is a list of roles

const MIN_ROLE = 0;
const MAX_ROLE = 3;

const viewer = 0;
const editor = 1;
const admin = 2;
const owner = 3;

function can_view(role) {
    return role >= viewer;
}

function can_edit(role) {
    return role >= editor;
}

function can_change_permissions(role) {
    return role >= admin;
}

function is_owner(role) {
    return role >= owner;
}


module.exports = {
    viewer,
    editor,
    admin,
    owner,
    can_view,
    can_edit,
    can_change_permissions,
    is_owner,
    MIN_ROLE,
    MAX_ROLE
}