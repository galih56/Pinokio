<?php

namespace App\Repositories;

use App\Interfaces\TagRepositoryInterface;
use App\Interfaces\RepositoryInterface;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;

class TagRepository extends BaseRepository
implements RepositoryInterface, TagRepositoryInterface
{
    protected $related_data = [];

    public function __construct(Tag $model)
    {
        parent::__construct($model);
    }
    
}
