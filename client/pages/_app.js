import 'bootstrap/dist/css/bootstrap.css'
import buildClient from "../api/build-client";
import Header from "../components/header";

const AppComponent = ({Component, pageProps, user}) => {
    return (
        <div>
            <Header user={user}/>
            <div className="container">
                <Component user={user} {...pageProps}/>
            </div>
        </div>
    )
}

AppComponent.getInitialProps = async appContext => {
    const client = buildClient(appContext.ctx)
    const {data} = await client.get('/api/users/current')
    let pageProps = {}
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.user)
    }

    return {pageProps, ...data}
}

export default AppComponent