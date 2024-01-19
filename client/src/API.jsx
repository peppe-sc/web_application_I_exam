import dayjs from 'dayjs';

const URL = 'http://localhost:3001';

async function setName(name){
  
  const response= await fetch(URL+'/page',{
    method: 'PUT',
    credentials: 'include',
    headers:{
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({name:name})
  });
  if(response.ok){
    return;
  }else{
    const err=await response.json();
    throw err;
  }
}

async function getName(){
  const response = await fetch(URL + '/name');
  const name = await response.json();
  if (response.ok) {
    return name;
  } else {
    throw name;
  }
}


async function getAllPub() {
  const response = await fetch(URL + '/pages/published');
  const pages = await response.json();
  if (response.ok) {
    return pages.map((x) => ({ id: x.id, title: x.title, author: x.author,status:x.status, date: dayjs(x.date, 'YYYY/MM/DD'), dataCreazione: dayjs(x.dataCreazione, 'YYYY/MM/DD') }));
  } else {
    throw pages;
  }
}

async function getAll() {
  const response = await fetch(URL + '/pages/all');
  const pages = await response.json();
  if (response.ok) {
    return pages.map((x) => ({ id: x.id, title: x.title,status:x.status, author: x.author, date: dayjs(x.date, 'YYYY/MM/DD'), dataCreazione: dayjs(x.dataCreazione, 'YYYY/MM/DD') }));
  } else {
    throw pages;
  }
}

async function getPage(id) {
  const response = await fetch(URL + '/pages/' + id);
  const blocks = await response.json();
  if (response.ok) {
    
    return blocks;
  } else {
    throw blocks;
  }
}

async function getPageTitle(id) {
  const response = await fetch(URL + '/pages/' + id + '/title');
  const title = await response.json();
  if (response.ok) {
    
    return title;
  } else {
    throw title.message;
  }
}

async function createPage(title,draft,date){
  const response= await fetch(URL+'/pages',{
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({title: title,draft: draft,date:date}),
  });
  if(response.ok){
    const id=await response.json();
    return id;
  }
  const err = await response.json();
  if (err.message) {
    throw err.message;
  } else {
    throw "Errore sconosciuto, potresti non essere autenticato?";
  }
}

async function getAuthors(){
  const response=await fetch(URL+'/authors');
  const authors=await response.json();
  if(response.ok){
    return authors.map(x=>x.name);
  }else{
    throw authors;
  }

}

async function getBlock(id){
  const response=await fetch(URL+'/blocks/'+id);
  const block=await response.json();
  if(response.ok){
    return block;
  }else{
    throw block;
  }

}

async function editBlock(block){
  
    const response = await fetch(URL + '/pages/' + block.page+'/'+block.id, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(block),
    });
    const result=await response.json();
    if (response.ok) {
      return true;
    }else{
      throw result;
    }
  
}

async function deletePage(id){
  const response=await fetch(URL+'/pages/'+id,{
    method:'DELETE',
    credentials: 'include',
  });

  if(response.ok){
    return;
  }
  const err = await response.json();
  if (err.message) {
    throw err.message;
  } else {
    throw "Errore sconosciuto, potresti non essere autenticato?";
  }

}

async function createBlock(block, id) {
  const response = await fetch(URL + '/pages/' + id, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(block),
  });
  
  if (response.ok) {
    return;
  }
  const err = await response.json();
  if (err.message) {
    throw err.message;
  } else {
    throw "Errore sconosciuto, potresti non essere autenticato?";
  }

}

async function updateOrder(blockList, pageid) {
  const response = await fetch(URL + '/backoffice/edit/' + pageid, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(blockList),
  });
  const result=await response.json();
  if (response.ok) {
    return true;
  }else{
    throw result;
  }
}


async function getImageList() {
  const response = await fetch(URL + '/images');
  const images = await response.json();
  if (response.ok) {
    
    return images.map((x) => x.imageName);
  } else {
    throw images;
  }
}

async function deleteBlock(blockid, pageid) {
  const response = await fetch(URL + '/pages/' + pageid + '/' + blockid, {
    method: 'DELETE',
    credentials: 'include',
  });
  const changes = await response.json();
  if (response.ok) {
    return changes;
  } else {
    throw changes;
  }
}

async function logIn(credentials) {
  let response = await fetch(URL + '/api/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

async function getUserInfo() {
  const response = await fetch(URL + '/api/sessions/current', {
    credentials: 'include'
  });

  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}



const API = {getName,setName,editBlock,getBlock,getAuthors,deletePage, getAllPub, createBlock, getPage, getAll, getImageList, logOut, logIn, getUserInfo, deleteBlock, getPageTitle, updateOrder,createPage };
export default API;