export const BASE_API_HOST = 'http://127.0.0.1:8000';
export const BACKEND_BASE_URL = BASE_API_HOST; // Alias for consistency

export const USER_INFO_ENDPOINT_URL = `${BASE_API_HOST}/user_info`
export const CHECK_LOGIN_ENDPOINT_URL= `${BASE_API_HOST}/check_login`
export const LOGIN_ENDPOINT_URL= `${BASE_API_HOST}/login`
export const REGISTER_ENDPOINT_URL= `${BASE_API_HOST}/register`
export const LOGOUT_ENDPOINT_URL= `${BASE_API_HOST}/logout`
export const ADD_WISHLIST_ENDPOINT_URL= `${BASE_API_HOST}/add_wishlist`
export const ADD_JOURNAL_ENDPOINT_URL= `${BASE_API_HOST}/add_journal`
export const PROFILE_INFO_ENDPOINT_URL= `${BASE_API_HOST}/user_info`
export const COUNTRY_INFO_ENDPOINT_URL = `https://restcountries.com/v3.1/name`

export const REMOVE_JOURNAL_ENDPOINT_URL = `${BASE_API_HOST}/remove_journal`

export const REMOVE_BUCKETLIST_ENDPOINT_URL = `${BASE_API_HOST}/remove_bucketlist`
export const ALL_REVIEWS_ENDPOINT_URL = `${BASE_API_HOST}/view_reviews`
export const MY_REVIEWS_ENDPOINT_URL = `${BASE_API_HOST}/view_self_reviews`
export const ADD_REVIEW_ENDPOINT_URL = `${BASE_API_HOST}/add_review`
export const PFP_UPDATE_ENDPOINT_URL = `${BASE_API_HOST}/update_pfp`

// Social Media endpoints
export const GET_POSTS_ENDPOINT_URL = `${BASE_API_HOST}/posts`
export const CREATE_POST_ENDPOINT_URL = `${BASE_API_HOST}/create_post`
export const GET_POST_DETAILS_ENDPOINT_URL = `${BASE_API_HOST}/posts`
export const STAMP_POST_ENDPOINT_URL = `${BASE_API_HOST}/posts`
export const GET_POST_COMMENTS_ENDPOINT_URL = `${BASE_API_HOST}/posts`
export const CREATE_COMMENT_ENDPOINT_URL = `${BASE_API_HOST}/posts`
export const CREATE_REPLY_ENDPOINT_URL = `${BASE_API_HOST}/comments`
