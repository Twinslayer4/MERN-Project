db = db.getSiblingDB('JobApplications');

if(!db.getCollectionNames().includes('users')) {
    db.createCollection('users')
}

if(!db.getCollectionNames().includes('companies')) {
    db.createCollection('companies')
}

if(!db.getCollectionNames().includes('application')) {
    db.createCollection('application')
}

let user = db.users.findOne({ login: "johnDoe" });
if(!user)
{
    const result = db.users.insertOne
    (
        {
        firstName: "John",
        lastName: "Doe",
        login: "johnDoe",
        password: "$2b$10$dcjsaXblFddld53QThfQAu9WLK7.I4iek3NSg8ruIzpS28Cqd0AIK", //bycrpt password of ucf123!
        email: "",
        role: "user"
        }
    );
    user = { _id: result.insertedId };
}

const userIdStr = user._id.toString();

let company1 = db.companies.findOne({name: 'Nvidia'})
if(!company1)
{
    const result = db.companies.insertOne
    (
        {
            name: 'Nvidia',
            country: 'United States',
            address: '12345 Research Parkway',
            state: 'FL',
            city: 'Ovedio',
            zipcode: 67890
        }
    );
    company = {_id: result.insertedId};
}

const company1Str = company1._id.toString();

let company2 = db.companies.findOne({name: 'Nvidia'})
if(!company2)
{
    const result = db.companies.insertOne
    (
        {
            name: 'Microsoft',
            country: 'United States',
            address: '23456 Research Parkway',
            state: 'FL',
            city: 'Ovedio',
            zipcode: 67890
        }
    );
    company = {_id: result.insertedId};
}

const company2Str = company2._id.toString();

let application1 = db.application.findOne({userID: userIdStr, companyID: company1Str});
if(!application1)
{
    db.application.insertOne
    (
        {
            jobTitle: 'Software Engineer Internship',
            status: 'Pending',
            userID: userIdStr,
            companyID: company1Str
        }
    )
}

let application2 = db.application.findOne({userID: userIdStr, companyID: company2Str});
if(!application2)
{
    db.application.insertOne
    (
        {
            jobTitle: 'Software Engineer Internship',
            status: 'Pending',
            userID: userIdStr,
            companyID: company2Str
        }
    )
}
