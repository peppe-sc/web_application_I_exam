import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import PageShow from "./PageShow";
import CreationForm from "./CreateForm";
import dayjs from "dayjs";
import API from "../API";
import { useNavigate } from "react-router-dom";



function PageCreation(props) {
    const [title, setTitle] = useState("");
    const [date,setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [creating, setCreating]=useState(false);
    const [draft,setDraft] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate=useNavigate();
    function handleSubmit(event){
        event.preventDefault();

        if(title==''){
            setErrorMsg('Please insert title');
            return;
        }
        

        setCreating(true);
        API.createPage(title,draft,date)
        .then((id)=>{
            setCreating(false);
            //console.log("questo è l'id: "+id);
            navigate('/backoffice/edit/'+id);
        })
        .catch((err)=>{setErrorMsg(err.message);setCreating(false);});
    }


    return (
        <>
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>
                        Page Title
                    </Form.Label>
                    <Form.Control type="text" name="title" value={title} onChange={ev=>setTitle(ev.target.value)}/>
                </Form.Group>
                {!draft?<Form.Group>
                    <Form.Label>
                        Publication Date
                    </Form.Label>
                    <Form.Control type="date" name="date" value={date} onChange={ev=>setDate(ev.target.value)}/>
                </Form.Group>:false}
                <Form.Group>
                    <Form.Label>
                        Draft
                    </Form.Label>
                    <Form.Check type="checkbox" onChange={ev=>setDraft((old)=>!old)}/>
                </Form.Group>
                <br />
                <Button type="submit" variant="success">Next</Button>
                {creating?<p>Creating page...</p>:false}
            </Form>

        </>
    );

}

export default PageCreation;