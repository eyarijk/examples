import React from "react";
import {
    Route,
    Redirect
} from "react-router-dom";
import {connect} from 'react-redux';
import {getAccessToken} from "../modules/auth/selectors";

const GuestRoute = ({children, ...props}) => {
    return (
        <Route
            {...props}
            render={({location}) =>
                !props.accessToken ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/staff",
                            state: {from: location}
                        }}
                    />
                )
            }
        />
    );
};

function mapStateToProps(state) {
    return {
        accessToken: getAccessToken(state),
    }
}

export default connect(mapStateToProps)(GuestRoute);
