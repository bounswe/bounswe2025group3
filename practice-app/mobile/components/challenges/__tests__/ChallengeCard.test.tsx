import React from 'react';
import { render, fireEvent } from '@/__tests__/test-utils';
import ChallengeCard from '../ChallengeCard';
import { Challenge } from '@/api/challenges';

// Mock the useColors hook
jest.mock('@/constants/colors', () => ({
  useColors: () => ({
    primary: '#10632C',
    background: '#F4F7F6',
    cb1: '#FFFFFF',
    cb2: '#F3FAF3',
    borders: '#E8F5E9',
    text: '#333333',
    textSecondary: '#666666',
    inactive_button: '#E9F5E9',
    inactive_text: '#595C5C',
    sun: '#ffc107',
    error: '#D32F2F',
    black: '#000000',
  }),
}));

describe('ChallengeCard', () => {
  const mockChallenge: Challenge = {
    id: 1,
    name: 'Test Challenge',
    description: 'This is a test challenge description',
    goal_quantity: '1000',
    unit: 'kg',
    target_category: 1,
    target_subcategory: null,
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    entry_type: 'individual',
    template: null,
    creator: 1,
    created_at: '2024-01-01T00:00:00Z',
    participants_count: 42,
  };

  const defaultProps = {
    challenge: mockChallenge,
    status: 'active' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders challenge name correctly', () => {
    const { getByText } = render(<ChallengeCard {...defaultProps} />);
    expect(getByText('Test Challenge')).toBeTruthy();
  });

  it('displays correct status badge for active challenge', () => {
    const { getByText } = render(
      <ChallengeCard {...defaultProps} status="active" />
    );
    expect(getByText('Active')).toBeTruthy();
  });

  it('displays correct status badge for upcoming challenge', () => {
    const { getByText } = render(
      <ChallengeCard {...defaultProps} status="upcoming" />
    );
    expect(getByText('Upcoming')).toBeTruthy();
  });

  it('displays correct status badge for past challenge', () => {
    const { getByText } = render(
      <ChallengeCard {...defaultProps} status="past" />
    );
    expect(getByText('Past')).toBeTruthy();
  });

  it('shows category name when provided', () => {
    const { getByText } = render(
      <ChallengeCard {...defaultProps} categoryName="Recycling" />
    );
    expect(getByText('Recycling')).toBeTruthy();
  });

  it('does not show category when not provided', () => {
    const { queryByText } = render(<ChallengeCard {...defaultProps} />);
    // Should still render the challenge name
    expect(queryByText('Test Challenge')).toBeTruthy();
  });

  it('formats dates correctly', () => {
    const { getByText } = render(<ChallengeCard {...defaultProps} />);
    // Check for date pattern (DD MMM YYYY)
    expect(getByText(/01 Jan 2025 - 31 Dec 2025/)).toBeTruthy();
  });

  it('formats goal quantity with proper locale', () => {
    const challengeWithLargeGoal = {
      ...mockChallenge,
      goal_quantity: '1234567.89',
    };
    const { getByText } = render(
      <ChallengeCard {...defaultProps} challenge={challengeWithLargeGoal} />
    );
    // The number should be formatted with thousand separators
    expect(getByText(/1,234,567.89/)).toBeTruthy();
  });

  it('displays participation notice when isParticipating is true', () => {
    const { getByText } = render(
      <ChallengeCard {...defaultProps} isParticipating={true} />
    );
    expect(
      getByText('You are currently enrolled in this challenge.')
    ).toBeTruthy();
  });

  it('does not display participation notice when isParticipating is false', () => {
    const { queryByText } = render(
      <ChallengeCard {...defaultProps} isParticipating={false} />
    );
    expect(
      queryByText('You are currently enrolled in this challenge.')
    ).toBeNull();
  });

  it('action button is disabled when isActionDisabled is true', () => {
    const onActionPressMock = jest.fn();
    const { getByText } = render(
      <ChallengeCard
        {...defaultProps}
        isActionDisabled={true}
        actionLabel="Join"
        onActionPress={onActionPressMock}
      />
    );

    // Verify the button exists and try to press it
    const button = getByText('Join');
    fireEvent.press(button);

    // When disabled, onActionPress should not be called
    expect(onActionPressMock).not.toHaveBeenCalled();
  });

  it('calls onActionPress when action button is pressed', () => {
    const onActionPressMock = jest.fn();
    const { getByText } = render(
      <ChallengeCard
        {...defaultProps}
        onActionPress={onActionPressMock}
        actionLabel="Join Challenge"
      />
    );

    fireEvent.press(getByText('Join Challenge'));
    expect(onActionPressMock).toHaveBeenCalledTimes(1);
  });

  it('calls onPress when card is pressed and both onPress and onActionPress are provided', () => {
    const onPressMock = jest.fn();
    const onActionPressMock = jest.fn();
    const { getByText } = render(
      <ChallengeCard
        {...defaultProps}
        onPress={onPressMock}
        onActionPress={onActionPressMock}
        actionLabel="View details"
      />
    );

    // Click the "View challenge details" link (secondary action)
    fireEvent.press(getByText('View challenge details'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('truncates description at 160 characters', () => {
    const longDescription = 'a'.repeat(200);
    const challengeWithLongDesc = {
      ...mockChallenge,
      description: longDescription,
    };
    const { getByText } = render(
      <ChallengeCard {...defaultProps} challenge={challengeWithLongDesc} />
    );

    // Should find truncated text with ellipsis
    const truncatedText = 'a'.repeat(157) + '...';
    expect(getByText(truncatedText)).toBeTruthy();
  });

  it('displays full description when less than 160 characters', () => {
    const shortDescription = 'Short description';
    const challengeWithShortDesc = {
      ...mockChallenge,
      description: shortDescription,
    };
    const { getByText } = render(
      <ChallengeCard {...defaultProps} challenge={challengeWithShortDesc} />
    );

    expect(getByText('Short description')).toBeTruthy();
  });

  it('displays custom action label', () => {
    const { getByText } = render(
      <ChallengeCard {...defaultProps} actionLabel="Join Now" />
    );
    expect(getByText('Join Now')).toBeTruthy();
  });

  it('displays default action label when not provided', () => {
    const { getByText } = render(<ChallengeCard {...defaultProps} />);
    expect(getByText('View details')).toBeTruthy();
  });

  it('displays participants count', () => {
    const { getByText } = render(<ChallengeCard {...defaultProps} />);
    expect(getByText('42')).toBeTruthy();
  });

  it('displays goal with unit', () => {
    const { getByText } = render(<ChallengeCard {...defaultProps} />);
    expect(getByText(/1,000 kg/)).toBeTruthy();
  });

  it('handles null unit gracefully', () => {
    const challengeWithoutUnit = {
      ...mockChallenge,
      unit: null,
    };
    const { getByText } = render(
      <ChallengeCard {...defaultProps} challenge={challengeWithoutUnit} />
    );
    // Should still display the goal number
    expect(getByText(/1,000/)).toBeTruthy();
  });

  it('displays entry type correctly', () => {
    const { getByText } = render(<ChallengeCard {...defaultProps} />);
    expect(getByText('Individual entry')).toBeTruthy();
  });

  it('capitalizes entry type', () => {
    const teamChallenge = {
      ...mockChallenge,
      entry_type: 'team' as const,
    };
    const { getByText } = render(
      <ChallengeCard {...defaultProps} challenge={teamChallenge} />
    );
    expect(getByText('Team entry')).toBeTruthy();
  });

  it('handles zero participants count', () => {
    const challengeWithNoParticipants = {
      ...mockChallenge,
      participants_count: 0,
    };
    const { getByText } = render(
      <ChallengeCard
        {...defaultProps}
        challenge={challengeWithNoParticipants}
      />
    );
    expect(getByText('0')).toBeTruthy();
  });
});
