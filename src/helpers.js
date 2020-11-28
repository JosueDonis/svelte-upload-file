export const ufid = (file) =>{
	let name = file.name.split(".")
	let ext = name.pop()
	return `${name.join(".")}-${Date.now()}.${ext}`
}

export const retrieveNewURL = async (file) => {
    let _ufid = ufid(file);
    file._ufid = _ufid;
    let response = await fetch(`https://tools.ubisuite.com/v1/file/upload`, {
		method: 'POST',
		body:JSON.stringify( {
			"key":"intcomex",
			"file":_ufid
		})
	});
    if (!response.ok) {
        const { status, statusText } = response;
        return Promise.reject(status, statusText);
    }
    const { signed_url } = await response.json();
    return {
        signed_url,
        file,
        _ufid
    }
}