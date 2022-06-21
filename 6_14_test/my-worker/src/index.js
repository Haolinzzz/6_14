const USAGE_LIMIT = 2;
//const sgMail = require('@sendgrid/mail')


//const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
console.log(AIRTABLE_API_KEY)
//const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
let airtableName = "Input"
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

//const FORM_URL = "https://aiwriter.pages.dev/"
//const RESULT_URL = "https://aiwriter.pages.dev/result"
//const FAIL_URL = "https://aiwriter.pages.dev/fail"


//const languageIdEnglish = '607adac76f8fe5000c1e636d'
//const toneIdConvincing = '60572a639bdd4272b8fe358b'
//const RYTE_API_KEY = process.env.RYTE_API_KEY
//const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY



async function handleRequest(request) {
    const url = new URL(request.url)
    //console.log(request.formData())
    if (url.pathname === "/submit") {
        return submitHandler(request)
    }

    return Response.redirect(FORM_URL)
}

const submitHandler = async request => {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
            status: 405
        })
    }
    const body = await request.formData();
    const {
        urlId=1,
        audio_url,
    } = Object.fromEntries(body)
    Object.fromEntries(body).audio_url=startRecording();
    console.log(Object.fromEntries(body))
    Object.fromEntries(body).urlId++;
    //let ryteId;

    // The keys in "fields" are case-sensitive, and
    // should exactly match the field names you set up
    // in your Airtable table, such as "First Name".
    const reqBody = {
        fields: {
            "urlID":urlId,
            "audio_url": audio_url,
        }
    }



    //console.log(userId + "used" + usage)

    //await incrementUsage({userId:userId})
    //await setUsage({userId:userId, usage:1000})
    //await sendEmail()

    await trans({urlId:urlId,audio_url:audio_url})

    await gettrans(trans({urlId:urlId,audio_url:audio_url}))

    //await ryte({userId:userId,jobTitle:jobType,ryteId:ryteId})
    //await createAirtableRecord({body:reqBody,tableName:"Input"})

    return Response.redirect(RESULT_URL)

}

async function getFieldId({urlId}){
    let response = await fetch('https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/user', {
        method:'GET',
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-type': `application/json`
        }
    });
    //console.log(await response.json())
    let res = await response.json()
    let records = res.records
    let id
    //console.log(res)
    for (const entry of records){
        if(entry.fields.urlId === urlId){
            id = entry.id
        }
    }
    return id;
}


async function createAirtableRecord ({body,tableName}) {
    //console.log(JSON.stringify(body))
    return fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-type': `application/json`
        }
    })
}
async function patchAirtableRecord ({body,tableName}) {
    //console.log("patch body:" + JSON.stringify(body))
    return fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-type': `application/json`
        }
    })
}

async function updateUserId ({urlId:urlId,fieldId:fieldId}) {

    let reqBody = {
        'records': [
            {
                'id': fieldId,
                'fields': {
                    'urlId': urlId

                }
            }
        ]
    }
    console.log("patch body:" + JSON.stringify(reqBody))
    return patchAirtableRecord({body:reqBody,tableName:"video"})
}

``// trans




async function trans(urlId,audio_url) {
    const reqBody = {
        'urlId':urlId,
        'audio_url': audio_url
    }
    console.log(JSON.stringify(reqBody))
    let response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
            'authorization':  `Bearer ${ASSEMBLY_API_KEY}`,
            'content-type': 'application/json'
        },
        // body: '{"audio_url": "https://bit.ly/3yxKEIY"}',
        body: JSON.stringify(reqBody.audio_url)
    });

    let data1 = await response.json()
    console.log(data1.id)
    const reqBody1 = {
        fields: {
            "urlId":urlId,
            "the video":audio_url,
            "transId": data1.id,
        }
    }

    await createAirtableRecord({body: reqBody1, tableName: "video"})


    return data1.id

}

async function gettrans(transId) {
    let response = await fetch('https://api.assemblyai.com/v2/transcript/'+transId, {
        headers: {
            'authorization': `Bearer ${ASSEMBLY_API_KEY}`,
            'content-type': 'application/json'
        }
    });

    let data2 = await response.json()
    console.log(data2.text)
    const reqBody2 = {
        fields: {
            "urlId":urlId,
            "text": data2.text,
        }
    }

    await createAirtableRecord({body: reqBody2, tableName: "text"})


    return data2.text
}
// (async () => {
//     let data = await useCaseDetailById(useCaseJobDescriptionId)
//     console.log(data)
// })()

