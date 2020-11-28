<script>
  import {createEventDispatcher} from 'svelte'
  import { fly, fade, } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import axios from 'axios'
  import {retrieveNewURL} from './helpers'
  export let files = []
  const dispatch = createEventDispatcher()
  

  $:files
  
  let CancelToken = axios.CancelToken;
  const handleFilesSelect = (e) => {
    const { acceptedFiles, fileRejections } = e.detail;
    files = [...files, ...acceptedFiles];
  }

  const upload = async(file) => {
    file.upload = true;
    file.progress = 0;
    files = files;
    let { signed_url, file: item, _ufid } = await retrieveNewURL(file);
    axios.request( {
      method: 'PUT', 
      url: signed_url, 
      data: item, 
      cancelToken: new CancelToken(c => {
         file.cancel = c;
         files = files;
      }),
      onUploadProgress: (p) => {
        file.progress =  Math.round(p.loaded * 100 / p.total );
        files = files;
      }

    }).then (data => {
      file.progress = 100;
      file.ufid = _ufid;
      file.upload = false;
      files = files;
      dispatch("upload", Object.keys(files).map(key => {return {name: files[key].name, ufid: files[key].ufid}}))
    })
  }

  const deleteFile = (file, i) => {
    let filter = Object.keys(files).filter(key => key != i).map(key => files[key])
    files = filter
    files = files
  }

  const cancelUpload = (file) => {
    file.cancel('Operation canceled.');
    delete file.cancel;
    file.upload = false;
    file.progress = 0;
    files = files;
  }

  const download = async(file) => {
    let res = await fetch(`https://tools.ubisuite.com/v1/file/download`, {
      method: 'POST',
      body:JSON.stringify( {
        "key":"intcomex",
        "file":file.ufid
      })
    })
    let json = await res.json();
    let url = new URL(json.signed_url);
    const link = document.createElement('a'); 
    link.href = url; 
    link.setAttribute('download', file.name); 
    document.body.appendChild(link); 
    link.click(); 
  }

  const addFiles = e => {
    let temp = e.target.files
    console.log(temp);
    if(!files.length) {
      files = temp
    }else {
      temp = [...files, ...temp]
      files = temp
      files = files
    }
  }
</script>

<style>
  .list {
    border-radius: 8px 8px;
    margin: 10px 10px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    padding: 5px;
    overflow-y: auto;
    scrollbar-width: none;
    height: auto;
    max-height: 400px;
    max-width: 400px;
  }
  .list::-webkit-scrollbar {
    display: none;
  }
  .list p {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .item {
    list-style: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 0 20px;
    border-radius: 8px 8px;
  }

  .item:hover {
    background: #fafafa;
  }

  .item p {
    width: 100%;
    margin: 16px 5px 16px 5px;
    
  }
  .actions {
    display: flex;
    flex-direction: row;
  }

  

  .input-file-container {
    position: relative;
    width: 280px;
  }

  .input-file {
    position: absolute;
    top: 0;
    left: 0;
    width: 280px;
    opacity: 0;
    padding: 14px 0;
    cursor: pointer;
  }

  .input-file-trigger{
    display:block;
    padding: 14px 45px;
    background: #000FBF;
    color: #fff;
    font-size: 1em;
    transition: all .4s;
    cursor: pointer;
    border-radius: 8px 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .input-file:hover + .input-file-trigger,
  .input-file:focus + .input-file-trigger,
  .input-file-trigger:hover,
  .input-file-trigger:focus {
    background: #000A80;
    color: #fff;
  }

  .upload-files {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .progress {
    width: 300px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  progress {
    background-color: #d8d8d8;
    border-radius: 8px;
    position: relative;
    height: 12px;
    width: 150px;
  }

  progress::-webkit-progress-bar {
    background-color: #d8d8d8;
    border-radius: 8px;
    position: relative;
    height: 12px;
    width: auto;
  }
  progress::-webkit-progress-value {
    background: #000A80;
    border-radius: 8px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 0;
    transition: 1s ease 0.3s;
  }
  progress::-moz-progress-bar {
    background-color: #d8d8d8;
    border-radius: 8px;
    position: relative;
    height: 12px;
    width: 150px;
  }

</style>

<div class="upload-files">
  <div class="input-file-container">
  <input type="file" id="files" multiple name="files" class="input-file"  on:change="{e=> {addFiles(e)}}">
    <label tabindex="0" class="input-file-trigger" for="files">Selecciona archivos</label>
  </div>
  {#if files.length}
    <ul class="list" >
      {#each files as file, i (file)}
      <li animate:flip  class="item" in:fade out:fly={{x:30}} >
          <svg width="24px" height="24px" viewBox="0 0 512 512"><path d="M416 221.25V416a48 48 0 01-48 48H144a48 48 0 01-48-48V96a48 48 0 0148-48h98.75a32 32 0 0122.62 9.37l141.26 141.26a32 32 0 019.37 22.62z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/><path d="M256 56v120a32 32 0 0032 32h120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>
          <p>{file.name}</p>
          {#if !file.upload}
            <div class="actions">
              {#if !file.ufid}
                <svg style="cursor: pointer; margin:4px 4px;" on:click="{e=>{upload(file)}}" width="24px" height="24px" viewBox="0 0 512 512"><title>Subir</title><path d="M320 367.79h76c55 0 100-29.21 100-83.6s-53-81.47-96-83.6c-8.89-85.06-71-136.8-144-136.8-69 0-113.44 45.79-128 91.2-60 5.7-112 43.88-112 106.4s54 106.4 120 106.4h56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 255.79l-64-64-64 64M256 448.21V207.79"/></svg>
              {:else}
                <svg style="cursor: pointer; margin:4px 4px;" on:click="{e=>{download(file)}}" width="24px" height="24px" viewBox="0 0 512 512"><title>Descargar</title><path d="M336 176h40a40 40 0 0140 40v208a40 40 0 01-40 40H136a40 40 0 01-40-40V216a40 40 0 0140-40h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M176 272l80 80 80-80M256 48v288"/></svg>
              {/if}
              <svg style="cursor: pointer; margin:4px 4px;" on:click="{e=>{deleteFile(file, i)}}" width="24px" height="24px"viewBox="0 0 512 512"><title>Eliminar</title><path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/><path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>
            </div>
          {:else}
            <div class="progress">
              <progress  max="100" value="{file.progress}"></progress>
              <svg style="cursor: pointer; margin:4px 4px;" on:click="{e=>{cancelUpload(file, i)}}" width="24px" height="24px"viewBox="0 0 512 512"><title>Cancelar</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 320L192 192M192 320l128-128"/></svg>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
