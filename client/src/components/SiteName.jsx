import { useState } from 'react';
import { Col, Container, Row, Button, Form, Table, Alert, Spinner } from 'react-bootstrap';
import API from '../API';
import { useNavigate, useParams, Link } from 'react-router-dom';


function Name(props){

    const [name, setName] = useState(props.name);
    const [errorMsg, setErrorMsg] = useState('');
    const [dirty,setDirty]=useState(false);
    const navigate=useNavigate();
    function handleSubmit(event){
        event.preventDefault();
        if(name==''){
            setErrorMsg("Name can't be empty");
            return;
        }
        setDirty(true);
        API.setName(name).then(()=>{setDirty(false);props.setName(name);navigate('/backoffice');}).catch((err)=>console.log(err));

        return;
    }


    return(
        <>  
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
            <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>Insert new name</Form.Label>
                    <Form.Control type="text" name="name" value={name} onChange={(event)=>{
                        setName(event.target.value);
                    }}/>
                </Form.Group>
                {dirty?false:<Button variant="success" type="submit">Save</Button>}
            </Form>
            {dirty?<p>Updating name</p>:false}
        </>
    );

}

export default Name;