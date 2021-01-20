import {useState} from 'react'
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

const NewTicket = () => {

    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const {doRequest, errors} = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {title, price},
        onSuccess: () => {
            (() => Router.push('/'))()
        }
    })

    const handleSubmit = async e => {
        e.preventDefault()
        await doRequest()
    }

    const formatPrice = () => {
        const value = parseFloat(price)
        if (isNaN(value)) {
            setPrice('')
            return
        }

        setPrice(value.toFixed(2))
    }

    return (
        <div className="row align-items-center mt-3" style={{border: '1px solid #00000050', borderRadius: 5}}>
            <div className="col-sm-6 m-auto p-3">
                <h4>Create a Ticket</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input type="text" name='title' id='title' className='form-control' value={title}
                               onChange={e => setTitle(e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input type="text" name='price' id='price' className='form-control' value={price}
                               onChange={e => setPrice(e.target.value)} onBlur={formatPrice}/>
                    </div>
                    {errors}
                    <button type='submit' className="btn btn-primary" disabled={price === ''}>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default NewTicket