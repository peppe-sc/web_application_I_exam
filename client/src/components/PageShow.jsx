import { useNavigate, useParams } from "react-router-dom";
import API from "../API";
import { Image, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";

const URL='http://localhost:3001';

function BasicSpinner() {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

function toHTML(p){
    //console.log(p);
    switch (p.type) {
        case 'header':
            return (<h3 >{p.content}</h3>);
        case 'paragraph':
            return (<p >{p.content}</p>);
        case 'image':
            return (<div ><Image width={500} height={400} src={URL+'/'+p.content} rounded /></div>);
        default:
            break;
    }
}

function Block(props){
    return (
        <>
            {toHTML(props.p)}
        </>
    )
}

function PageShow(props){
    //console.log(props.page);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState([]);
    const { pageid } = useParams();
    const [title, setTitle] = useState('');
    const navigate=useNavigate();
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

        }).catch((err)=>navigate('/'));
    }, [loading])

    return (
        <>  
            {loading? <BasicSpinner/>:<><h1 style={{textAlign: 'center'}}>{title}</h1>
            {page.map((p)=><Block p={p} key={p.block_id}/>)}</>}
        </>
    );
}

export default PageShow;