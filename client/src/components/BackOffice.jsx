import { Button, Spinner, Table } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import { useEffect, useState } from 'react';
function BasicSpinner() {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }
function Bottone(props) {
    const navigate = useNavigate();
    return (
        <>
        
        <Button onClick={(event) => { navigate('/backoffice/create'); }} className='rounded-circle' style={{ bottom: 10, right: 10, position: 'absolute', width: 70, height: 70 }}>+</Button>
        </>
    );
}

function MyRow(props) {
    const page = props.page;
    const navigate = useNavigate();

    return (
        <tr>
            <td>{page.title}</td>
            <td>{page.author}</td>
            <td>{page.status}</td>
            <td>{page.date.isValid()? page.date.format('DD-MM-YYYY'):"draft"}</td>
            <td>{page.dataCreazione.format('DD-MM-YYYY')}</td>
            <td><Button onClick={(event) => {
                navigate('/pages/' + page.id);
            }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                </svg></Button > {(props.loggedIn && page.author == props.user.name) || props.user.admin ? <><Button onClick={(event) => navigate('/backoffice/edit/' + page.id)} variant='warning' ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                </svg></Button> <Button onClick={(event)=>{
                    props.setPages((old)=>{
                        return old.map((e)=>{
                            if(e.id==page.id){
                                e.title=e.title+'(deleting...)';
                            }
                            return e;
                        });
                    });
                    API.deletePage(page.id).then((c)=>{
                        props.setLoading(true);
                    }).catch((e)=>{
                        console.log(e);
                        navigate('/');
                    });
                }} variant='danger'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                </svg></Button></> : false}</td>


        </tr>
    );
}

function PageListBack(props) {

    const [loading, setLoading] = useState(true);
    const [pages,setPages] = useState([]);

    const navigate=useNavigate();

    useEffect(() => {
        if (!loading) {
            return;
        }
        //setLoading(true);

        API.getAll()
            .then((lpages) => {
                setPages(lpages);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                navigate('/');
            });
    }, [loading]);

    return (
        <>
            {loading?<BasicSpinner/>:<><Table striped className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Publication Date</th>
                        <th>Creation Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pages ?pages.map((p) => <MyRow user={props.user} loggedIn={props.loggedIn} setTitle={props.setTitle} setDirty={props.setDirty} setPages={setPages} setLoading={setLoading} key={p.id} page={p} />) : false}
                </tbody>
            </Table>
            <Bottone user={props.user} />
            {props.user && props.user.admin?<Button variant='warning' className='rounded-circle' style={{ bottom: 10, right: 100, position: 'absolute', width: 70, height: 70 }} onClick={(event)=>{
                navigate('/backoffice/editName');
            }}>Edit name</Button>:false}</>}
        </>
    );
}

export default PageListBack;