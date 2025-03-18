<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $assignee_id
 * @property string $assignee_type
 * @property int $assignable_id
 * @property string $assignable_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $assignable
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $assignee
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment whereAssignableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment whereAssignableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment whereAssigneeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment whereAssigneeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assignment whereUpdatedAt($value)
 */
	class Assignment extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $comment
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $commentable_type
 * @property int|null $commentable_id
 * @property string|null $commenter_type
 * @property int|null $commenter_id
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent|null $commentable
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent|null $commenter
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CommentRead> $reads
 * @property-read int|null $reads_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereCommentableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereCommentableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereCommenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereCommenterType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Comment whereUpdatedAt($value)
 */
	class Comment extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $comment_id
 * @property string|null $read_at
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property int $user_id
 * @property-read \App\Models\Comment $comment
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead whereCommentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentRead whereUserId($value)
 */
	class CommentRead extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $path
 * @property string $mime_type
 * @property int $size
 * @property string $uploaded_at
 * @property int|null $uploader_id
 * @property string|null $uploader_type
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Issue> $related
 * @property-read int|null $related_count
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent|null $uploader
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File wherePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File whereUploadedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File whereUploaderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|File whereUploaderType($value)
 */
	class File extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $file_id
 * @property int $related_id
 * @property string $related_type
 * @property-read \App\Models\File $file
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileAssociation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileAssociation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileAssociation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileAssociation whereFileId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileAssociation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileAssociation whereRelatedId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileAssociation whereRelatedType($value)
 */
	class FileAssociation extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Comment> $comments
 * @property-read int|null $comments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\File> $files
 * @property-read int|null $files_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Logs\IssueLog> $issueLogs
 * @property-read int|null $issue_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Issue> $issues
 * @property-read int|null $issues_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GuestIssuer whereUpdatedAt($value)
 */
	class GuestIssuer extends \Eloquent {}
}

namespace App\Models\Logs{
/**
 * 
 *
 * @property int $id
 * @property int $issue_id
 * @property string $action
 * @property string $action_details
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $user_id
 * @property string|null $user_type
 * @property-read \App\Models\Issue $issue
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereActionDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereIssueId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IssueLog whereUserType($value)
 */
	class IssueLog extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectRole newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectRole newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectRole query()
 */
	class ProjectRole extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $color
 * @property bool $is_public
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Issue> $issues
 * @property-read int|null $issues_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereIsPublic($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereUpdatedAt($value)
 */
	class Tag extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $color
 * @property string|null $description
 * @property int $creator_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Assignment> $assignments
 * @property-read int|null $assignments_count
 * @property-read \App\Models\User|null $creator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TeamMember> $members
 * @property-read int|null $members_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team whereCreatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Team whereUpdatedAt($value)
 */
	class Team extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $team_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Team $team
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember whereTeamId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamMember whereUserId($value)
 */
	class TeamMember extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $username
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $role_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Assignment> $assignments
 * @property-read int|null $assignments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Comment> $comments
 * @property-read int|null $comments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\File> $files
 * @property-read int|null $files_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Logs\IssueLog> $issueLogs
 * @property-read int|null $issue_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Issue> $issues
 * @property-read int|null $issues_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CommentRead> $readComments
 * @property-read int|null $read_comments_count
 * @property-read \App\Models\UserRole|null $role
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Team> $teams
 * @property-read int|null $teams_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUsername($value)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $code
 * @property string|null $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserRole whereUpdatedAt($value)
 */
	class UserRole extends \Eloquent {}
}

