export interface IBeerStyle {
    category: string,
    countryOfOrigin: string,
    ibu: number,
    abv: number
}

export interface IBeerRecipe {
    style: IBeerStyle,
    malt: string,
    hops: string,
    yeast: string,
    fermentationTemp: number
    owner: IUser
}

export interface IUser {

}

// TODO: Your database needs to have at least two entities as well as some 
//      sort user representation. In the relational database sense there 
//      will be at a minimum 3 entities (one of which are users) and a 
//      minimum of two relationships. The two non-user entities need to be 
//      related to each other and the user needs to be related to at least 
//      one of those entities.

// Entity Requirements
// TODO: Each entity must be represented by its own URL as a collection 
//      (eg. /ships represents the ships collection)
// TODO: The root collection URL for an entity must implement paging 
//      showing 5 entities at a time
// TODO: At a minimum it must have a 'next' link on every page except the 
//      last
// TODO: The collection must include a property that indicates how many 
//      total items are in the collection
// TODO: Every representation of an entity must have a 'self' link pointing 
//      to the canonical representation of that entity (full URL, not 
//      relative path)
// TODO: Each entity must have at least 3 properties, related entities are 
//      not consider a property in this count (eg. the slip that a ship is 
//      in is not a property)
// TODO: It must be possible to create, read, update and delete every entity (must 
//      handle any "side effects" similar how you had to update cargo when 
//      deleting a ship)
// TODO: Relationships creation and deletion should be handled via PUTs and 
//      DELETEs to URLs
// TODO: You only need to support JSON representations, however, you should 
//       reject any request that does not include `application/json` in the 
//      accept header
// TODO: Status Codes
//      You should support the following status codes
//      200
//      201
//      204
//      401
//      403
//      404
//      405
//      406
// User Accounts
// TODO: You must support the ability for clients to create user accounts
// TODO: You are allowed to use a `/login` URL where a user can provide a 
//      username and password even though this is not RESTful
// TODO: You may choose from the following methods of handling user accounts
//      You can handle all account creation and authentication yourself
//      You can use OpenID Connect or some other 3rd party authentication service
// TODO: Requests beyond the initial login should use a JWT for authentication
// TODO: User entities should only be able to be operated on by the user 
//      (eg. Alice should only be able to view and edit herself, Bob cannot 
//      view the Alice user and Alice cannot view the Bob user)
// TODO: One of the non-user entities must be a thing which is owned by a 
//      user and is only editable by the user which created it. For example, 
//      in a to-do list tracker a user might be the owner of a particular 
//      to-do list. Only they can edit the list. (Others might still be 
//      able to view it)