import { useNavigate, useParams } from "react-router-dom";
import API from "../API";
import { Alert, Button, Image, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import CreationForm from "./CreateForm";

const URL = 'http://localhost:3001';

function ButtonGroup(props) {
    const navigate=useNavigate();
    const { pageid } = useParams();
    return (<>
        <Button onClick={(event) => {

            API.deleteBlock(props.block.block_id, props.block.page_id)
                .then((changes) => props.setLoading(true))
                .catch((err) => { props.setErrorMsg('Unable to delete block, there should be at least one header and one paragraph or image'); props.setLoading(true); });

            props.setPage((old) => {
                return old.map((x) => {
                    if (x.block_id == props.block.block_id) {
                        x.type = 'paragraph';
                        x.content = 'deleting block...';
                        return x;
                    }
                    return x;
                });

            });
        }} variant="danger"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
            </svg></Button> <Button onClick={(event)=>{
                navigate('/backoffice/edit/'+pageid+'/'+props.block.block_id);
            }} variant="warning"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
            </svg></Button> <Button onClick={(event) => {
                if (props.block.index == 0) {
                    return;
                }
                const indexRef=props.block.index;
                //console.log(indexRef);
                props.setChanges((old)=>old+1);
                props.setPage((old) => {
                    let nuovi = old.map((p) => {
                        if (p.index == indexRef - 1 && p.block_id!=props.block.block_id) {
                            
                            p.index = indexRef;
                            
                        } else if (p.block_id == props.block.block_id) {
                            
                            p.index = indexRef - 1;
                        }
                        return p;
                    });
                    //console.log(props.blockList);
                    return nuovi.sort((a, b) => {
                        return a.index - b.index;
                    });
                });
                //console.log(props.block);
            }} variant="secondary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
            </svg></Button> <Button onClick={(event) => {
                let maxIndex = 0;
                props.blockList.forEach(element => {
                    if (element.index > maxIndex) {
                        maxIndex = element.index;
                    }

                });
                
                if (props.block.index == maxIndex) {
                    return;
                }
                props.setChanges((old)=>old+1);
                const indexRef=props.block.index;
                //console.log(indexRef);
                props.setPage((old) => {
                    let nuovi = old.map((p) => {
                        if (p.index == indexRef + 1  && p.block_id!=props.block.block_id) {
                            //console.log("metto a "+p.content+"  "+(indexRef-1));
                            p.index = indexRef;
                        } else if (p.block_id == props.block.block_id) {
                            //console.log("metto a "+p.content+"  "+(indexRef-1));
                            p.index = indexRef + 1;
                        }
                        return p;
                    });
                    //console.log(props.blockList);
                    return nuovi.sort((a, b) => {
                        return a.index - b.index;
                    });
                });


            }} variant="secondary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
            </svg></Button>

    </>);
}

function BasicSpinner() {
    return (
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    );
}

function toHTML(p, setPage, setLoading, setErrorMsg, blockList,setChanges,saving) {
    //console.log(p);
    switch (p.type) {
        case 'header':
            return (<>
                <h3>{p.content} {saving?false:<ButtonGroup setChanges={setChanges} blockList={blockList} setErrorMsg={setErrorMsg} block={p} setPage={setPage} setLoading={setLoading} />}</h3>

            </>);
        case 'paragraph':
            return (<>
                <p >{p.content} {saving?false:<ButtonGroup setChanges={setChanges} blockList={blockList} setErrorMsg={setErrorMsg} block={p} setPage={setPage} setLoading={setLoading} />}</p>

            </>);
        case 'image':
            return (<div>
                <Image width={500} height={400} src={URL + '/' + p.content} rounded />

                {saving?false:<ButtonGroup setChanges={setChanges} blockList={blockList} setErrorMsg={setErrorMsg} block={p} setPage={setPage} setLoading={setLoading} />}

            </div>);
        default:
            break;
    }
}

function Block(props) {
    return (
        <>
            {toHTML(props.p, props.setPage, props.setLoading, props.setErrorMsg, props.blockList,props.setChanges,props.saving)}
        </>
    )
}

/*function Show(props){
    const [showForm,setShowForm] = useState(false);
    return (<>
        {showForm? <CreationForm page={props.page} setPage={props.setPage} setShowForm={setShowForm}/>:<>{props.page.map((p)=><Block p={p} key={p.block_id}/>)}<Button onClick={(event)=>setShowForm(true)}>Add Block</Button></>}
    </>);
}*/

function PageShowEdit(props) {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState([]);
    const { pageid } = useParams();
    const [errorMsg, setErrorMsg] = useState('');
    const [title, setTitle] = useState('');
    const [changes,setChanges]=useState(0);
    const [saving,setSaving]=useState(false);
    useEffect(() => {
        if (!loading) {
            return;
        }
        API.getPage(pageid).then((p) => {
            API.getPageTitle(pageid).then((t) => {
                setPage(p);
                setTitle(t);
                setLoading(false);
            });

        })
    }, [loading])

    //console.log(page);
    return (
        <>
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> :false}
            
            <h1 style={{ textAlign: 'center' }}>{title}</h1>
            {loading ? <BasicSpinner /> : <>{page.map((p) => <Block saving={saving} setChanges={setChanges} blockList={page} setErrorMsg={setErrorMsg} setPage={setPage} setLoading={setLoading} p={p} key={p.block_id} />)}<br /> <Button onClick={(event) => navigate('/backoffice/edit/' + pageid + '/addblockform')}>Edit Options</Button> </>}
            {changes>0?<Button variant="success" onClick={(event)=>{
                setSaving(true);
                API.updateOrder(page,pageid).then((ok)=>{setChanges(0);setSaving(false);}).catch((err)=>{setErrorMsg("Error updating the order");setLoading(true);});
            }}>Save Order, buttons will be disabled until the operation is complete</Button>:false}
            
        </>
    );
}

export default PageShowEdit;

