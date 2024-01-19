import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row, Button, Form, Table } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import API from './API';
import TitleBar from './components/TitleBar'
import PageList from './components/PagesList';
import { LoginForm } from './components/AuthComponents';
import PageShow from './components/PageShow';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import PageListBack from './components/BackOffice';
import PageCreation from './components/PageCreation';
import PageShowEdit from './components/ShowEditPage';
import CreationForm from './components/CreateForm';
import BlockEditForm from './components/BlockEdit';
import Name from './components/SiteName';


function BasicSpinner() {
  return (
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}

function DefaultRoute(props) {
  return (
    <Container className='App'>
      <h1>No data here...</h1>
      <h2>This is not the route you are looking for!</h2>
      <Link to='/' onClick={props.setReaload(true)}>Please go back to main page</Link>
    </Container>
  );
}



function App() {
  const [name, setName] = useState('');
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [lista, setLista] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dirty, setDirty] = useState(true);
  const [page, setPage] = useState(undefined);
  const [title, setTitle] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [reaload, setReaload] = useState(true);

  const loginSuccessful = (user) => {
    setUser(user);
    
    setLoggedIn(true);
    setReaload(true);  // load latest version of data, if appropriate
  }

  function handleError(err) {
    console.log('err: ' + JSON.stringify(err));  // Only for debug
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0])
        if (err.errors[0].msg)
          errMsg = err.errors[0].msg;
    } else if (err.error) {
      errMsg = err.error;
    }

    setErrorMessage(errMsg);
    setTimeout(() => setReaload(true), 2000);  // Fetch correct version from server, after a while
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        
      } catch (err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();
  }, []);

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    /* set state to empty if appropriate */
  }

  useEffect(() => {
    if (!reaload) {
      return;
    }
    setDirty(true);
    API.getAllPub()
    .then((x) => { /*console.log(x);*/ setLista(x); API.getName().then(n=>{setName(n);setDirty(false); setReaload(false);}).catch(e=>console.log(e)); })
    .catch((err) => handleError(err));
  }, [reaload])

  return (
    <BrowserRouter>
      <Routes>


        <Route path='/' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setPages={setLista} setDirty={setDirty} name={name} />
            {dirty ? <BasicSpinner /> : <PageList pages={lista} setTitle={setTitle} setDirty={setDirty} setPage={setPage}></PageList>}
          </>
        } />


        <Route path='/login' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setPages={setLista} setDirty={setDirty} name={name} />
            {loggedIn ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />}
          </>
        } />


        <Route path='/backoffice' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setDirty={setDirty} setPages={setLista} name={name} />
            {dirty ? <BasicSpinner /> : <PageListBack pages={lista} setTitle={setTitle} setDirty={setDirty} setPage={setPage} loggedIn={loggedIn} user={user}></PageListBack>}
          </>
        } />


        <Route path='/backoffice/create' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setDirty={setDirty} setPages={setLista} name={name} />
            <PageCreation />
          </>
        } />

        <Route path='/backoffice/edit/:pageid' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setDirty={setDirty} setPages={setLista} name={name} />
            <PageShowEdit />
          </>
        } />

        <Route path='/backoffice/editName' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setDirty={setDirty} setPages={setLista} name={name} />
            <Name name={name} setName={setName}/>
          </>
        } />

        <Route path='/backoffice/edit/:pageid/addblockform' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setDirty={setDirty} setPages={setLista} name={name} />
            <CreationForm user={user} />
          </>
        } />

        <Route path='/backoffice/edit/:pageid/:blockid' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setDirty={setDirty} setPages={setLista} name={name} />
            <BlockEditForm user={user} />
          </>
        } />

        <Route path='/pages/:pageid' element={
          <>
            <TitleBar setReaload={setReaload} user={user} loggedIn={loggedIn} doLogOut={doLogOut} setPages={setLista} setDirty={setDirty} name={name} />
            {dirty ? <BasicSpinner /> : <PageShow title={title} page={page} setPage={setPage} setDirty={setDirty} />}
          </>
        } />


        <Route path='/*' element={<DefaultRoute setReaload={setReaload} />} />


      </Routes>

    </BrowserRouter>
  )
}

export default App
