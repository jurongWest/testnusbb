import toilet1 from "./images/toilet1.jpg"
import toilet2 from "./images/toilet2.jpg"
import toilet3 from "./images/toilet3.jpg"
import toilet4 from "./images/toilet4.jpg"
import toilet5 from "./images/toilet5.jpg"
import toilet6 from "./images/toilet6.jpg"
import toilet7 from "./images/toilet7.jpg"
import toilet8 from "./images/toilet8.jpg"
import toilet9 from "./images/toilet9.jpg"
import toilet10 from "./images/toilet10.jpg"

export default [
    {
        sys: {
            id: "1"
        },
        fields: {
            name: "toilet1",
            slug: "toilet1",
            building: "COM1",
            level: 1,
            bidet: true,
            paddispenser: false
        },
        images: [
            {
                fields: {
                    file: {
                        url: toilet1
                    }
                }
            },
            {
                fields: {
                    file: {
                        url: toilet2
                    }
                }
            },
            {
                fields: {
                    file: {
                        url: toilet3
                    }
                }
            }
        ]
    }
]