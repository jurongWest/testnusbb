import toilet1 from "./images/toilet1.jpg"
import toilet2 from "./images/toilet2.jpg"
import toilet3 from "./images/toilet3.jpg"

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