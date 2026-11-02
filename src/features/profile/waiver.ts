// Sample waiver text. The real text comes per gym from the admin Waiver Forms page.
export const WAIVER_TITLE = 'Wulf Fitness waiver';
export const WAIVER_POINTS = [
  'I am in good health and able to take part in exercise. I will tell the staff about any injury or condition that changes this.',
  'I understand that exercise carries some risk of injury, and I take part at my own risk.',
  'I will use the equipment as shown and follow the instructions of the gym staff.',
  'I agree that the gym is not responsible for loss of my belongings.',
];

export const fmtSigned = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
