const port = process.env.WEB_PORT || 8080;
const WS_IP = process.env.WS_IP || 'localhost';

const IP = `http://${WS_IP}:${port}`;
const tokenName = 'userToken';

function saveToken(token) {
  localStorage.setItem(tokenName, token);
}
function getToken() {
  return localStorage.getItem(tokenName);
}


export async function postTokens(email, password) {
  const response = await fetch(`${IP}/api/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  saveToken(response.headers.get('Location'));
  return response;
}

export async function getMyDetails() {
    const token = getToken();
    const response = await fetch(`${IP}/api/users/me`, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
    });

    return response;
}

export async function postFiledir(payload) {
  const token = getToken();
  const response = await fetch(`${IP}/api/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return response;
}

export async function getFilesBySearch(searchQuery) {
  const token = getToken();
  const response = await fetch(`${IP}/api/search/${encodeURIComponent(searchQuery)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response;
}

export async function getFilesByCategory(category) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files?q=${category || 'home'}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    return response;
}

export async function getFilesByDirectory(directoryId) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(directoryId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (data.sub_filedirs) {
        response.json = async () => data.sub_filedirs;
    }
    return response;
}

export async function getFileById(fileId) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    return response;
}

export async function patchFile(fileId, data) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return response;
}

export async function setStar(fileId,isStarred) {
    return await patchFile(fileId, { starred: isStarred });
}


export async function deleteFile(fileId) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    return response;
}

export async function postUser(userData) {
    const token = getToken();
    const response = await fetch(`${IP}/api/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    return response;
}

export async function getRole(fileId) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${fileId}/permissions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const permissions = await response.json();
    const me = (await getMyDetails());
    const uid = (await me.json()).uid;
    try {
        return permissions.filter(permission => permission.uid === uid)[0].role
    } catch (error) {
        return response;
    }
}

// Permissions API:

// Get the list of permissions for a specific file
export async function getFilePermissions(fileId) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}/permissions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}

// Add a new user to the permissions list
export async function addFilePermission(fileId, email, role) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}/permissions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
    });
    return response;
}

// Update an existing user's role
export async function updateFilePermission(fileId, pid, role, uidOfUser) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}/permissions/${pid}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, uid: uidOfUser })
    });
    return response;
}

// Remove a user from the permissions list
export async function deleteFilePermission(fileId, pid) {
    const token = getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}/permissions/${pid}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export async function getAllFiles() {
    const token = getToken();
    const response = await fetch(`${IP}/api/files`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export async function getAllStaredFiles() {
    const token = getToken();
    const response = await fetch(`${IP}/api/files?q=starred`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}

