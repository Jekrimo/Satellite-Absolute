import DetectRTC from "detectrtc"

type PermissionRequestOptions = "audio" | "video"

interface permissionObject {
    hasWebcam: Boolean
    hasMicrophone: Boolean
    hasSpeakers: Boolean
    browser: String
    permissions: {
        webcam: Boolean
        microphone: Boolean
    },
    devices: {
        audioIn: any[]
        audioOut: any[]
        videoIn: any[]
    },
    blocked: {
        audio: Boolean,
        video: Boolean
    }
}

interface Device {
    text: string
    value: string
}

const formatDevices = async (devices: any[]) => {
    let responsearray: Device[] = [];
    await devices.map(device => {
        // Chrome based browsers add a 'default' item that is a duplicate of another item in the list. This prevents that from going into the options the user sees.
        // The default capture devices will be listed first - https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
        if (
            (device.label.indexOf('Default - ') === -1)
        ) {

            const item = {
                text: device.label as string,
                value: device.deviceId as string,
            } as Device;

            responsearray.push(item)
        }
    })
    return responsearray;
}
const getRTC = async () => {
    let promise = await new Promise((resolve, reject) => {
        let responseObject: permissionObject = {
            hasWebcam: false,
            hasMicrophone: false,
            hasSpeakers: false,
            browser: 'Chrome',
            permissions: {
                webcam: false,
                microphone: false
            },
            devices: {
                audioIn: [],
                audioOut: [],
                videoIn: []
            },
            blocked: {
                audio: false,
                video: false
            }
        }
        DetectRTC.load(() => {

            responseObject.hasWebcam = DetectRTC.hasWebcam
            responseObject.hasMicrophone = DetectRTC.hasMicrophone
            responseObject.hasSpeakers = DetectRTC.hasSpeakers
            responseObject.browser = DetectRTC.browser.name

            if (DetectRTC.isWebsiteHasWebcamPermissions) {
                responseObject.permissions.webcam = DetectRTC.isWebsiteHasWebcamPermissions
                responseObject.devices.videoIn = DetectRTC.videoInputDevices
            }
            if (DetectRTC.isWebsiteHasMicrophonePermissions) {
                responseObject.permissions.microphone = DetectRTC.isWebsiteHasMicrophonePermissions
                formatDevices(DetectRTC.audioOutputDevices).then(formattedResponse => {
                    responseObject.devices.audioOut = formattedResponse;
                })
                formatDevices(DetectRTC.audioInputDevices).then(formattedResponse => {
                    responseObject.devices.audioIn = formattedResponse;
                })
            }
            resolve(responseObject);
        });
    })
        .catch(err => { throw err });

    return promise
}

export const UserPermissions = {
    created: () => {
        // can add functions here on start-up if needed
    },
    methods: {
        async getUserPermissions() {
            // Todo: Firefox does not allow querying for Microphone https://github.com/mozilla/standards-positions/issues/19, and is spotty in it's implementation of the permissions api
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1609427
            return await getRTC()
        },
        async requestUserPermissions(permission: PermissionRequestOptions) {
            let permissionValue: any = {
                [permission as any]: true
            }
            return await navigator.mediaDevices.getUserMedia({ ...permissionValue })
        }
    }
}