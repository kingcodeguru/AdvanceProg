import AsyncStorage from '@react-native-async-storage/async-storage';

const port = process.env.WEB_PORT || 8080;
const WS_IP = process.env.WS_IP || '192.168.7.27';

const IP = `http://${WS_IP}:${port}`;
const tokenName = 'userToken';

async function saveToken(token) {
  try {
    await AsyncStorage.setItem(tokenName, token);
  } catch (e) {
    console.error(e);
  }
}

async function getToken() {
  try {
    return await AsyncStorage.getItem(tokenName);
  } catch (e) {
    return null;
  }
}

export async function postTokens(email, password) {
  console.log('trying to post tokens');
  const response = await fetch(`${IP}/api/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  console.log('successfully posted tokens');

  const location = response.headers.get('Location');
  if (location) {
    await saveToken(location);
  }
  return response;
}

export async function getMyDetails() {
    const token = await getToken();
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
  const token = await getToken();
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
  const token = await getToken();
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
    const token = await getToken();
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
    const token = await getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(directoryId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (data.sub_filedirs) {
        // Preserving original logic of overriding .json()
        response.json = async () => data.sub_filedirs;
    }
    return response;
}

export async function getFileById(fileId) {
    const token = await getToken();
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
    const token = await getToken();
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
    const token = await getToken();
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
    const token = await getToken();
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
    const token = await getToken();
    const response = await fetch(`${IP}/api/files/${fileId}/permissions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    try {
        const permissions = await response.json();
        const me = await (await getMyDetails()).json();
        const uid = me.uid;
        return permissions.filter(permission => permission.uid === uid)[0].role
    } catch (error) {
        return response;
    }
}

export async function getFilePermissions(fileId) {
    const token = await getToken();
    const response = await fetch(`${IP}/api/files/${encodeURIComponent(fileId)}/permissions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export async function addFilePermission(fileId, email, role) {
    const token = await getToken();
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

export async function updateFilePermission(fileId, pid, role, uidOfUser) {
    const token = await getToken();
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

export async function deleteFilePermission(fileId, pid) {
    const token = await getToken();
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
    const token = await getToken();
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
    const token = await getToken();
    const response = await fetch(`${IP}/api/files?q=starred`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}