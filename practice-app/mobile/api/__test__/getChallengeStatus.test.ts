import { getChallengeStatus } from '../challenges';

describe('getChallengeStatus', () => {
  it('should return "upcoming" for future challenges', () => {
    const today = new Date('2024-01-15');
    const challenge = {
      start_date: '2024-01-20',
      end_date: '2024-01-30',
    };

    const status = getChallengeStatus(challenge, today);
    expect(status).toBe('upcoming');
  });

  it('should return "active" for ongoing challenges', () => {
    const today = new Date('2024-01-15');
    const challenge = {
      start_date: '2024-01-10',
      end_date: '2024-01-20',
    };

    const status = getChallengeStatus(challenge, today);
    expect(status).toBe('active');
  });

  it('should return "past" for ended challenges', () => {
    const today = new Date('2024-01-15');
    const challenge = {
      start_date: '2024-01-01',
      end_date: '2024-01-10',
    };

    const status = getChallengeStatus(challenge, today);
    expect(status).toBe('past');
  });

  it('should return "active" when reference date is same as start date', () => {
    const today = new Date('2024-01-15');
    const challenge = {
      start_date: '2024-01-15',
      end_date: '2024-01-20',
    };

    const status = getChallengeStatus(challenge, today);
    expect(status).toBe('active');
  });

  it('should return "active" when reference date is same as end date', () => {
    const today = new Date('2024-01-20');
    const challenge = {
      start_date: '2024-01-15',
      end_date: '2024-01-20',
    };

    const status = getChallengeStatus(challenge, today);
    expect(status).toBe('active');
  });

  it('should return "past" when reference date is after end date', () => {
    const today = new Date('2024-01-21');
    const challenge = {
      start_date: '2024-01-15',
      end_date: '2024-01-20',
    };

    const status = getChallengeStatus(challenge, today);
    expect(status).toBe('past');
  });

  it('should use current date when no reference date is provided', () => {
    const challenge = {
      start_date: '2020-01-01',
      end_date: '2020-01-31',
    };

    const status = getChallengeStatus(challenge);
    expect(status).toBe('past');
  });

  it('should handle single day challenges correctly', () => {
    const today = new Date('2024-01-15');
    const challenge = {
      start_date: '2024-01-15',
      end_date: '2024-01-15',
    };

    const status = getChallengeStatus(challenge, today);
    expect(status).toBe('active');
  });
});

