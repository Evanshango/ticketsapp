import {useState} from 'react'
import useRequest from "../../hooks/useRequest";
import Router from 'next/router'

const Signin = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {doRequest, errors} = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {email, password},
        onSuccess: () => {
            (() => Router.push('/'))()
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        await doRequest()
    }

    return (
        <div style={{background: '#82828220', height: '100vh'}}>
            <div className="container" style={{height: '70vh'}}>
                <div className="row align-items-center h-100">
                    <div className="col-sm-6 m-auto">
                        <div className="card">
                            <div className="card-header text-center">
                                <h6>SIGNIN</h6>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input type="text" className="form-control" id='email' name='email'
                                               value={email} onChange={e => setEmail(e.target.value)}/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Password</label>
                                        <input type="password" className="form-control" id='password' name='password'
                                               value={password} onChange={e => setPassword(e.target.value)}/>
                                    </div>
                                    {errors}
                                    <button type='submit' className="btn btn-primary">Sign In</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signin