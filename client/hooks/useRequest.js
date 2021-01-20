import axios from "axios";
import {useState} from 'react'

const useRequest = ({url, method, body, onSuccess}) => {
    const [errors, setErrors] = useState(null)

    const doRequest = async (props = {}) => {
        try {
            setErrors(null)
            const {data} = await axios[method](url, {...body, ...props})
            if (onSuccess) onSuccess(data)
            return data
        } catch (err) {
            const {response: {data}} = err
            setErrors(
                <div className="alert alert-danger">
                    <h6>Oops...</h6>
                    <ul className="my-0">
                        {data.errors.map((err, index) => (
                            <li key={index}>
                                {err.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )
        }
    }
    return {doRequest, errors}
}

export default useRequest