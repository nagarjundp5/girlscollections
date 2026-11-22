export interface GoogleReview {
  id: string;
  authorName: string;
  initial: string;
  rating: number; // 5
  text: string;
  hearts: number;
  relativeTime: string;
}

export const googleReviews: GoogleReview[] = [
  {
    id: 'rev-1',
    authorName: 'Mahesh',
    initial: 'M',
    rating: 5,
    text: 'Very good collections for kids and helpful staff gives better discount',
    hearts: 2,
    relativeTime: '2 months ago',
  },
  {
    id: 'rev-2',
    authorName: 'Chaithra Avinash',
    initial: 'C',
    rating: 5,
    text: 'Very huge collections for both kids and ladies and they do take stitching orders and staff are very helpful',
    hearts: 2,
    relativeTime: '3 months ago',
  },
  {
    id: 'rev-3',
    authorName: 'Lakshmi R',
    initial: 'L',
    rating: 5,
    text: 'Very nice collection and affordable price thank you so much',
    hearts: 1,
    relativeTime: 'a month ago',
  },
  {
    id: 'rev-4',
    authorName: 'Nikhil B',
    initial: 'N',
    rating: 5,
    text: "Purchased 2 dresses for my mom, the quality of the dress is so great and very comfortable at very reasonable price. I'd recommend you all to visit the store for the quality and the vast variety of selection for both kids and ladies.",
    hearts: 1,
    relativeTime: '4 months ago',
  },
  {
    id: 'rev-5',
    authorName: 'Rashmi Gowda',
    initial: 'R',
    rating: 5,
    text: 'Got traditional wear for my kids, very comfortable and good quality',
    hearts: 3,
    relativeTime: '2 months ago',
  },
  {
    id: 'rev-6',
    authorName: 'Abhi Ram',
    initial: 'A',
    rating: 5,
    text: 'Very good collection and nice quality 🤗',
    hearts: 2,
    relativeTime: '5 months ago',
  },
  {
    id: 'rev-7',
    authorName: 'Savithra',
    initial: 'S',
    rating: 5,
    text: 'Very huge collections for kids, would recommend for kids clothes',
    hearts: 2,
    relativeTime: '3 months ago',
  },
  {
    id: 'rev-8',
    authorName: 'Ankit Banger',
    initial: 'A',
    rating: 5,
    text: 'Best collection and best owner ♥️♥️',
    hearts: 2,
    relativeTime: 'a month ago',
  },
  {
    id: 'rev-9',
    authorName: 'MaNasa RajEndra',
    initial: 'M',
    rating: 5,
    text: 'I got 5 dresses from them, and I’m really happy with the quality. They also had everything ready exactly at the time they promised. The team was very friendly and treated us so well. Overall, it was a wonderful experience! ❤️',
    hearts: 1,
    relativeTime: '2 months ago',
  },
  {
    id: 'rev-10',
    authorName: 'Muruli Manu',
    initial: 'M',
    rating: 5,
    text: 'Good response and very good collection',
    hearts: 2,
    relativeTime: '6 months ago',
  },
];

export const GOOGLE_MAPS_REVIEWS_URL =
  'https://www.google.com/maps/search/?api=1&query=The+Girls+Collections+Gandhi+Bazaar';

export default googleReviews;
