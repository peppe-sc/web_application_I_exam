import { Col, Container, Row, Button, Form, Table, Alert, Spinner } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../API';
import PageShow from './PageShow';

function BasicSpinner() {
    return (
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    );
}

function CreationForm(props) {
    const navigate = useNavigate();

    const { pageid } = useParams();

    const [type, setType] = useState(0);
    const [image, setImage] = useState(undefined);
    const [text, setText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [dirty, setDirty] = useState(false);
    const [draft,setDraft] = useState(false);
    const [authors,setAuthors]= useState([]);
    
    useEffect(() => {
        if (!loading) {
            return;
        }
        API.getImageList().then((i) => {
             setImages(i);
              
              API.getAuthors().then(a=>{
                
                setAuthors(a);
                setLoading(false);
              });
             });
    }, [])



    function handleSubmit(event) {
        event.preventDefault();
        //let blocco={block_id: indice,type: type,content: text,index: indice}
        //console.log(blocco);
        if (!text || text == 'Open this select menu') {
            setErrorMsg('Please insert block content');
            return;
        } else if (!type || type == 'Open this select menu') {
            setErrorMsg('Please insert block type');
            return;
        }else if(!image && type=='image'){
            setErrorMsg('Please insert a valid image name');
            return;
        }else if(type=="author" && !authors.includes(text)){
            setErrorMsg('Please insert a valid author');
            return;
        }else if(type=="date" && (!dayjs(text,'YYYY-MM-DD').isValid()||dayjs(text,'YYYY-MM-DD').isBefore(dayjs(dayjs().format('YYYY-MM-DD'),'YYYY-MM-DD'))) ){
            setErrorMsg('Please insert a valid date');
            return;
        }

        setDirty(true);
        API.createBlock({ type: type, content: text,draft: draft }, pageid).then(() => { setDirty(false); navigate('/backoffice/edit/' + pageid); }).catch((err) => { setErrorMsg(err.message); setDirty(false); });


    }

    return (
        <>
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}


            {loading?false:<Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>Block Type</Form.Label>
                    <Form.Select aria-label="Default select example" onChange={(event) => { setType(event.target.value); setImage(undefined); if(event.target.value=="date"){setText(dayjs().format('YYYY-MM-DD'));}}}>
                        <option>Open this select menu</option>
                        <option value="header">Add Header</option>
                        <option value="paragraph">Add Paragraph</option>
                        <option value="image">Add Image</option>
                        <option value="title">Set Title</option>
                        <option value="date">Set Date</option>
                        {props.user && props.user.admin?<option value="author">Set Author</option>:false}
                    </Form.Select>
                </Form.Group>
                {type=="date"? <Form.Group>
                    <Form.Label>
                        Draft
                    </Form.Label>
                    <Form.Check type="checkbox" onChange={ev=>{setDraft((old)=>!old);}}/>
                </Form.Group>:false}
                {type == "image" ? <Form.Group className='mb-3'>
                    <Form.Label>Select The Image</Form.Label>
                    <Form.Select aria-label="Default select example" onChange={(event) => { setText(event.target.value); setImage(true); }}>
                        <option>Open this select menu</option>
                        {images.map((im, indice) => <option key={indice} value={im.imageName}>{im}</option>)}
                    </Form.Select>
                </Form.Group> :type=="date"? <Form.Group className='mb-3'>
                    <Form.Label>Text</Form.Label>
                    <Form.Control type="date" name="text" value={text} onChange={ev => setText(ev.target.value)} />
                </Form.Group>:type=='author'? <Form.Group className='mb-3'>
                    <Form.Label>Select The Author</Form.Label>
                    <Form.Select aria-label="Default select example" onChange={(event) => { setText(event.target.value);}}>
                        <option>Open this select menu</option>
                        {authors.map((au, indice) => <option key={indice} value={au}>{au}</option>)}
                    </Form.Select>
                </Form.Group>:<Form.Group className='mb-3'>
                    <Form.Label>Text</Form.Label>
                    <Form.Control type="text" name="text" value={text} onChange={ev => setText(ev.target.value)} />
                </Form.Group>}


                <Button type='submit' variant="primary">{'Save'}</Button>
                {/* alternative
            <Button className='mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button> */}

                <Button className='mx-2' variant='danger' onClick={(event) => { navigate('/backoffice/edit/' + pageid) }}>Cancel</Button>

            </Form>}
            {dirty ? <><BasicSpinner /><p>Creating block, you will be redirected soon</p></> : false}
        </>
    );

}

export default CreationForm